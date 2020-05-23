## Project Overview

This project is a simple REST API built on Express for the sake of learning. It allows users to create and manage customly defined tasks. The project also includes several scripts to deploy the application to Elastic Kubernetes Service (EKS) on AWS, which is performed from a Jenkins CI/CD pipeline, as part of my capstone project that applies some of the skills acquired throughout Udacity's Cloud DevOps nanodegree.

## Documentation

The project contains a [Postman Collection](task_manager_api.postman_collection.json) that can be imported into your Postman account.

## Prerequisites to run the project locally

* Node.js is required to run the API locally. You can find the lastest version on [their website](https://nodejs.org/en/).
* The API stores all the information in MongoDB, therefore, a MongoDB instance must be set up before launching the API. You can either create one using [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or run your own locally on your host or using [their official Docker image](https://hub.docker.com/_/mongo).

## Setup the local environment

* Run `npm install` to install the necessary node modules
* Create a .env file with the following environment variables:
    * `PORT` Host port the API will listening on.
    * `SECRET_KEY` API secret key used to encode and decode user tokens.
    * `EMAIL_SERVICE_KEY` SendGrid key to send welcome emails to your users.
    * `MONGO_DB_URL` MongoDB database endpoint.
    * `MONGO_DB_NAME` MongoDB database name.

### Getting up and running

There are three different ways in which the API can be launched.

1. Standalone:  `npm start`
2. Run in Docker:  `sh ./run_docker.sh`. This shell script builds the Docker image and runs a Docker container from it
3. Run in Kubernetes:  `sh ./run_kubernetes.sh`. This shell script creates a deployment with two pods running the API image and exposes them through a load balancer

### Upload changes to Elastic Container Registry (ECR)

In order to upload any changes to the project to ECR, you just need to run `sh ./upload_docker.sh`. This will replace the latest version with your local version tagged as `task-manager-api:latest`.

However, if you have a configured Jenkins pipeline with access to ECR this task will be performed automatically when triggered by a GitHub push event.

### Project structure and files

```bash
.
│   blue_green_deployment.sh # Shell script to make a blue green deployment on Kubernetes
│   Dockerfile # File with instructions on how to build the Docker image based on Node.js
│   Dockerfile.ci # Docker environment to run the CI pipeline
│   Jenkinsfile # Defines the CI/CD pipeline in Jenkins
│   package-lock.json # List of required Node modules
│   package.json # List of required Node modules and scripts to run and tests the app
│   README.md # Documentation
│   run_docker.sh # Shell script to run the API on Docker
│   run_kubernetes.sh # Shell script to run the API on Kubernetes
│   task_manager_api.postman_collection.json # Postman collection to connect to the API
│   upload_docker.sh # Shell script to upload the Docker image to ECR
├───k8s # Kubernetes YAML files to deploy the API and IaC to create the EKS cluster
├───src # Source folder that contains the application codebase
│   ├───db # MongoDB setup
│   ├───emails # Modules to send emails to the application users 
│   ├───middleware # API middleware
│   ├───models # Mongoose database models
│   └───routers # API endpoints
└───tests # Unit tests
```