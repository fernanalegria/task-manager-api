pipeline {
    agent {
        docker {
            image 'node:14.2.0-alpine'
        }
    }
    stages {
        stage('Build') {
            steps {
                sh 'npm install'
            }
        }
        stage('Lint JS code') {
            steps {
                sh 'npm run pretest'
            }
        }
    }
}