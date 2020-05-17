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
    }
}