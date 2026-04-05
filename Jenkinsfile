pipeline {
    agent any

    stages {
        stage('Test') {
            steps {
              sh 'npm install'
              sh 'npm test'
            }
        }
        
        stage('Build & Run Docker') {
            steps {
                sh '''
                docker-compose down || true
                docker-compose build
                docker-compose up -d
                '''
            }
        }
    }
}