pipeline {
    agent node
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
                    def image = docker.build("task-manager-api:${env.BUILD_ID}")
                }
            }
        }
    }
}