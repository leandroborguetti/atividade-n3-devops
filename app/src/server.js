const express = require('express');
const mysql = require('mysql2/promise');
const { createClient } = require('redis');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const APP_VERSION = process.env.APP_VERSION || '1.0';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = Number(process.env.DB_PORT || 3306);
const DB_NAME = process.env.DB_NAME || 'loja';
const DB_USER = process.env.DB_USER || 'loja_user';
const DB_PASSWORD = process.env.DB_PASSWORD || 'loja_pass';
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = Number(process.env.REDIS_PORT || 6379);

let pool;
let redisClient;

async function initConnections() {
  pool = mysql.createPool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
  });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS produtos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nome VARCHAR(120) NOT NULL,
      preco DECIMAL(10, 2) NOT NULL
    )
  `);

  redisClient = createClient({
    url: `redis://${REDIS_HOST}:${REDIS_PORT}`
  });
  redisClient.on('error', (err) => console.error('Redis error:', err));
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
}

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    const pong = await redisClient.ping();
    res.status(200).json({
      status: 'ok',
      version: APP_VERSION,
      mysql: 'connected',
      redis: pong
    });
  } catch (err) {
    res.status(503).json({
      status: 'error',
      message: err.message
    });
  }
});

app.get('/produtos', async (req, res) => {
  try {
    const cached = await redisClient.get('produtos:all');
    if (cached) {
      return res.json({ source: 'cache', version: APP_VERSION, data: JSON.parse(cached) });
    }
    const [rows] = await pool.query('SELECT * FROM produtos');
    await redisClient.setEx('produtos:all', 15, JSON.stringify(rows));
    res.json({ source: 'mysql', version: APP_VERSION, data: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/produtos', async (req, res) => {
  try {
    const { nome, preco } = req.body;
    if (!nome || preco === undefined) {
      return res.status(400).json({ error: 'Informe nome e preco' });
    }
    const [result] = await pool.query(
      'INSERT INTO produtos (nome, preco) VALUES (?, ?)',
      [nome, preco]
    );
    await redisClient.del('produtos:all');
    res.status(201).json({ id: result.insertId, nome, preco });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

initConnections()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API v${APP_VERSION} rodando na porta ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Falha na inicializacao:', err);
    process.exit(1);
  });
