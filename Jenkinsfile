pipeline {
    agent any

    stages {
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