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
                    args '-u root:root'
                }
            }
            steps {
                script {
                    withAWS(credentials: 'aws-credentials', region: 'us-east-2') {
                        TM_PORT = sh(returnStdout: true, script: 'aws ssm get-parameter \
                        --name TaskManagerPort --output text --query "Parameter.Value"')
                        TM_SECRET_KEY = sh(returnStdout: true, script: 'aws ssm get-parameter \
                        --name TaskManagerSecretKey --output text --query "Parameter.Value"')
                        TM_EMAIL_SERVICE_KEY = sh(returnStdout: true, script: 'aws ssm get-parameter \
                        --name TaskManagerEmailServiceKey --output text --query "Parameter.Value"')
                        TM_MONGO_DB_URL = sh(returnStdout: true, script: 'aws ssm get-parameter \
                        --name TaskManagerMongoDBUrl --output text --query "Parameter.Value"')
                        TM_MONGO_DB_NAME = sh(returnStdout: true, script: 'aws ssm get-parameter \
                        --name TaskManagerMongoDBName --output text --query "Parameter.Value"')
                    }
                }
                withAWS(credentials: 'aws-credentials', region: 'us-east-2') {
                    sh 'aws eks --region us-east-2 update-kubeconfig --name production'
                    sh """
                        set +x
                        kubectl create secret generic prod-env \
                        --from-literal=PORT=${TM_PORT} \
                        --from-literal=SECRET_KEY=${TM_SECRET_KEY} \
                        --from-literal=EMAIL_SERVICE_KEY=${TM_EMAIL_SERVICE_KEY} \
                        --from-literal=MONGO_DB_URL=${TM_MONGO_DB_URL} \
                        --from-literal=MONGO_DB_NAME=${TM_MONGO_DB_NAME}
                        set -x 
                    """
                }
            }
        }
    }
}