pipeline {
    agent {
        dockerfile {
            filename 'Dockerfile.ci'
        }
    }
    stages {
        stage('Lint JS code') {
            steps {
                sh 'node --version'
                sh 'npm --version'
                sh 'ls -la'
                sh 'ls -la /'
            }
        }
    }
}