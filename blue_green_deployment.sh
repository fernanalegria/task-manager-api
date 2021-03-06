# This file makes a blue green deployment of the task manager API in Kubernetes

# Reads an environment variable from AWS parameter store
read_var() {
    VAR=$(aws ssm get-parameter --name $1 --output text --query "Parameter.Value")
    echo ${VAR}
}

# Step 1:
# Set environment variables
REGISTRY_URL="490300663378.dkr.ecr.us-east-2.amazonaws.com"
DOCKER_IMAGE="task-manager-api:latest"

# Step 2:
# Create a secret with the environment variables needed
if [ $(kubectl get secret prod-env -o jsonpath='{.kind}') ]
  then
    kubectl delete secret prod-env
fi
kubectl create secret generic prod-env \
    --from-literal=PORT="$(read_var TaskManagerPort)" \
    --from-literal=SECRET_KEY="$(read_var TaskManagerSecretKey)" \
    --from-literal=EMAIL_SERVICE_KEY="$(read_var TaskManagerEmailServiceKey)" \
    --from-literal=MONGO_DB_URL="$(read_var TaskManagerMongoDBUrl)" \
    --from-literal=MONGO_DB_NAME="$(read_var TaskManagerMongoDBName)"

# Step 3:
# Create a deployment of the new version
kubectl apply -f k8s/release-candidate-deployment.yaml

# Step 4:
# Point the load balancer to the new version
while [ ! $(kubectl get deployment release-candidate -o jsonpath="{.status.availableReplicas}") ] \
  || [ $(kubectl get deployment release-candidate -o jsonpath="{.status.availableReplicas}") -lt 2 ]; do
    echo "Waiting for release-candidate deployment to be ready..."
done
kubectl apply -f k8s/release-candidate-load-balancer.yaml

# Step 5:
# Replace the old version with the new version
kubectl delete deployment task-manager-api
kubectl apply -f k8s/api-deployment.yaml

# Step 6:
# Point the load balancer back to the task-manager-api deployment and delete the other deployment
while [ ! $(kubectl get deployment task-manager-api -o jsonpath="{.status.availableReplicas}") ] \
  ||[ $(kubectl get deployment task-manager-api -o jsonpath="{.status.availableReplicas}") -lt 2 ]; do
    echo "Waiting for task-manager-api deployment to be ready..."
done
kubectl apply -f k8s/api-load-balancer.yaml
kubectl delete deployment release-candidate
