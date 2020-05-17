pipeline {
    agent any
    stages {
        stage('Lint JS code') {
            agent {
                dockerfile {
                    filename 'Dockerfile.ci'
                }
            }
            steps {
                sh 'eslint --ignore-path .gitignore .'
            }
        }
        stage('Build image') {
            steps {
                script {
                    docker.build("task-manager-api:${env.BUILD_ID}")
                }
            }
        }
        stage('Push image') {
            steps {
                script {
                    docker.withRegistry('https://490300663378.dkr.ecr.us-east-2.amazonaws.com', 'ecr:us-east-2:aws-credentials') {
                        def image = docker.image("task-manager-api:${env.BUILD_ID}")
                        image.push()
                        image.push('latest')
                    }
                }
            }
        }
        stage('Deploy to EKS') {
            agent {
                docker {
                    image 'weaveworks/eksctl'
                }
            }
            steps {
                withAWS(credentials: 'aws-credentials', region: 'us-east-2') {
                    sh 'aws s3 ls'
                }
            }
        }
    }
}