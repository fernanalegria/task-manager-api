#!/usr/bin/env bash
# This file tags and uploads an image to ECR

# Assumes that an image is built via `run_docker.sh`

# Step 1:
# Create dockerpath
REGISTRY_URL="490300663378.dkr.ecr.us-east-2.amazonaws.com"
DOCKER_IMAGE="task-manager-api:latest"

# Step 2:  
# Authenticate & tag
aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin $REGISTRY_URL
docker tag task-manager-api:latest $REGISTRY_URL/$DOCKER_IMAGE

# Step 3:
# Push image to the ECR repository
docker push $REGISTRY_URL/$DOCKER_IMAGE

# Step 4:
# Log out of ECR
docker logout
