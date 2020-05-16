#!/usr/bin/env bash
# This file tags and uploads an image to ECR

# Assumes that an image is built via `run_docker.sh`

# Step 1:
# Set environment variables
REGISTRY_URL="490300663378.dkr.ecr.us-east-2.amazonaws.com"
DOCKER_IMAGE="task-manager-api:latest"

# Step 2:
# Create a secret from a token to access ECR
kubectl create secret docker-registry regcred --docker-server=$REGISTRY_URL \
    --docker-username=AWS --docker-password=$(aws ecr get-login-password --region us-east-2)

# Step 3:
# Create a task-manager-api deployment with two replicas 
kubectl apply -f api-deployment.yaml

# Step 4:
# Create a load balancer that exposes the replicas evenly
kubectl apply -f load-balancer.yaml
