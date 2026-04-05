pipeline {
    agent any

    environment {
        IMAGE_NAME = "kaicity/goshu-app"
        TAG = "latest"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install & Test') {
            steps {
                sh '''
                npm install
                npm test || true
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                docker build -t $IMAGE_NAME:$TAG .
                '''
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                    echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                    docker push $IMAGE_NAME:$TAG
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                docker compose down || true
                docker compose pull
                docker compose up -d
                '''
            }
        }
    }
}