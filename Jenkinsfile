pipeline {
    agent {
        dockerfile {
            filename 'Dockerfile.ci'
        }
    }
    stages {
        stage('Lint JS code') {
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