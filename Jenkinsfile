pipeline {
    agent any
    stages {
        stage('Lint JS code') {
            steps {
                sh 'eslint --ignore-path .gitignore .'
            }
        }
    }
}