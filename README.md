# Atividade Avaliativa N3 - DevOps & Cloud Computing

Aplicacao Node.js com MySQL e Redis, empacotada com Docker, orquestrada via Docker Compose e implantada no Kubernetes (namespace n3-leandro).

## Estrutura do projeto
- app/: codigo da API (/health, /produtos), Dockerfile e .dockerignore
- docker-compose.yml e .env.example: execucao local com API, MySQL e Redis
- k8s/: manifestos Kubernetes (Namespace, ConfigMap, Secret, Redis, MySQL + PVC, API e HPA)
- comandos.md: comandos operacionais da Parte 4

## Como subir com Docker Compose
1. Copie .env.example para .env (sem senhas reais):
   Copy-Item .env.example .env
2. Suba os servicos:
   docker compose up -d
3. Valide /health e a persistencia do banco antes e apos docker compose down e docker compose up -d.

## Como subir no Kubernetes (Minikube)
1. Garanta que o cluster Minikube esta ativo e o namespace n3-leandro existe.
2. Carregue a imagem da API no Minikube:
   minikube image load loja-api:1.0
3. Aplique os manifestos:
   kubectl apply -f k8s/
   kubectl get all -n n3-leandro
