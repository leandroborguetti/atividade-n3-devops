# Evidencias - Atividade N3 (DevOps)

- **Namespace Kubernetes:** n3-leandro
- **Cluster:** Minikube (v1.39.0 / Kubernetes v1.37.0, driver docker)
- **Imagem API:** loja-api:1.0

## 1. Docker e Docker Compose
- Imagem loja-api:1.0 criada e stack executada com api, mysql e redis.
- Endpoint /health validado e persistencia do MySQL testada com down/up.

## 2. Kubernetes (namespace n3-leandro)
- Manifestos aplicados em k8s/ (Namespace, ConfigMap, Secret, Redis, MySQL + PVC, loja-api, HPA).
- Todos os Pods em estado Running (loja-api, mysql, redis) e mysql-pvc Bound.
- /health retornou ok (version 1.0, mysql connected, redis PONG).
- POST e GET /produtos validaram cadastro e leitura do item "Teclado K8s" (id: 1, preco: 299.00).
- Persistencia confirmada apos deletar o Pod do MySQL e subir um novo Pod com mysql-pvc.
