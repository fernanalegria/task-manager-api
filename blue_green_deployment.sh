#!/usr/bin/env bash
# This file makes a blue green deployment of the task manager API in Kubernetes

# Reads an environment variable from a .env file
read_var() {
    VAR=$(grep $1 prod.env | xargs)
    IFS="=" read -ra VAR <<< "$VAR"
    echo ${VAR[1]}
}

# Step 1:
# Set environment variables
REGISTRY_URL="490300663378.dkr.ecr.us-east-2.amazonaws.com"
DOCKER_IMAGE="task-manager-api:latest"

# Step 2:
# Create a secret from a token to access ECR
if [ $(kubectl get secret regcred -o jsonpath='{.kind}') ]
  then
    kubectl delete secret regcred
fi
kubectl create secret docker-registry regcred --docker-server=$REGISTRY_URL \
    --docker-username=AWS --docker-password=$(aws ecr get-login-password --region us-east-2)

# Step 3:
# Create a secret with the environment variables needed
if [ $(kubectl get secret prod-env -o jsonpath='{.kind}') ]
  then
    kubectl delete secret prod-env
fi
kubectl create secret generic prod-env \
    --from-literal=PORT="$(read_var PORT)" \
    --from-literal=SECRET_KEY="$(read_var SECRET_KEY)" \
    --from-literal=EMAIL_SERVICE_KEY="$(read_var EMAIL_SERVICE_KEY)" \
    --from-literal=MONGO_DB_URL="$(read_var MONGO_DB_URL)" \
    --from-literal=MONGO_DB_NAME="$(read_var MONGO_DB_NAME)"

# Step 4:
# Create a deployment of the new version
kubectl apply -f k8s/release-candidate-deployment.yaml

# Step 5:
# Point the load balancer to the new version
while [ ! $(kubectl get deployment release-candidate -o jsonpath="{.status.availableReplicas}") ] \
  || [ $(kubectl get deployment release-candidate -o jsonpath="{.status.availableReplicas}") -lt 2 ]; do
    echo "Waiting for release-candidate deployment to be ready..."
done
kubectl apply -f k8s/release-candidate-load-balancer.yaml

# Step 6:
# Replace the old version with the new version
kubectl delete deployment task-manager-api
kubectl apply -f k8s/api-deployment.yaml

# Step 7:
# Point the load balancer back to the task-manager-api deployment and delete the other deployment
while [ ! $(kubectl get deployment task-manager-api -o jsonpath="{.status.availableReplicas}") ] \
  ||[ $(kubectl get deployment task-manager-api -o jsonpath="{.status.availableReplicas}") -lt 2 ]; do
    echo "Waiting for task-manager-api deployment to be ready..."
done
kubectl apply -f k8s/api-load-balancer.yaml
kubectl delete deployment release-candidate
