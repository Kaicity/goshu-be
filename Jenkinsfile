pipeline {
    agent any

    stages {
        stage('Clone Code') {
            steps {
                git 'https://github.com/Kaicity/goshu-be'
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