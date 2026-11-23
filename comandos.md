# Comandos Executados - Parte 4 (Operacao do Cluster)

Namespace: n3-leandro | Cluster: Minikube (driver docker)

## 4.1 Escalar na mao (2 -> 4 -> 2 replicas)
minikube addons enable metrics-server
kubectl scale deployment loja-api -n n3-leandro --replicas=4
kubectl get pods -n n3-leandro
kubectl scale deployment loja-api -n n3-leandro --replicas=2
kubectl get pods -n n3-leandro

## 4.2 Atualizar sem derrubar (imagem 2.0)
docker build -t loja-api:2.0 .\app
minikube image load loja-api:2.0
kubectl set image deployment/loja-api loja-api=loja-api:2.0 -n n3-leandro
kubectl rollout status deployment/loja-api -n n3-leandro
kubectl rollout history deployment/loja-api -n n3-leandro

## 4.3 Falha proposital e recuperacao (rollout undo)
kubectl set image deployment/loja-api loja-api=loja-api:nao-existe-999 -n n3-leandro
kubectl get pods -n n3-leandro
kubectl describe pod NOME_DO_POD_COM_ERRO -n n3-leandro
kubectl rollout undo deployment/loja-api -n n3-leandro
kubectl rollout status deployment/loja-api -n n3-leandro
kubectl rollout history deployment/loja-api -n n3-leandro

## 4.4 Limitar recursos (requests e limits)
kubectl set resources deployment loja-api -n n3-leandro --requests=cpu=150m,memory=128Mi --limits=cpu=400m,memory=256Mi
kubectl rollout status deployment/loja-api -n n3-leandro
kubectl describe pod NOME_DO_POD_LOJA_API -n n3-leandro

## 4.5 Autoscaling (HPA) com carga
kubectl autoscale deployment loja-api -n n3-leandro --min=2 --max=5 --cpu-percent=50
kubectl create deployment load-gen -n n3-leandro --image=busybox:1.36 -- /bin/sh -c "while true; do wget -q -O- http://loja-api:3000/produtos >/dev/null 2>&1 || true; done"
kubectl scale deployment load-gen -n n3-leandro --replicas=4
kubectl get hpa -n n3-leandro
kubectl delete deployment load-gen -n n3-leandro
kubectl get hpa -n n3-leandro

## 4.6 Descricao do no
kubectl describe node minikube
kubectl top pods -n n3-leandro
