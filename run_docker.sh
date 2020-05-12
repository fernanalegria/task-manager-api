#!/usr/bin/env bash

## Complete the following steps to get Docker running locally

# Step 1:
# Build image and add a descriptive tag
docker build --tag=task-manager-api:latest .

# Step 2 locally:
# Run an Express API container
docker run --env-file ./local-docker.env -p 3000:3000 -d task-manager-api:latest
