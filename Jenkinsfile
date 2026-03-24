pipeline {
    agent any
    environment {
        ANSIBLE_HOST = '172.31.79.4'
        DOCKER_HOST = '172.31.83.90'
    }
    stages {
        stage('Pull Code') {
            steps {
                checkout scm
            }
        }
        stage('Copy to Ansible') {
            steps {
                sshagent(['ansible-ssh']) {
                    sh '''
                        rsync -av --exclude="node_modules" --exclude=".git" \
                        -e "ssh -o StrictHostKeyChecking=no" \
                        "AI BASED TALENT MANAGEMENT SYSTEM/backend" \
                        itadmin@172.31.79.4:/tmp/
                        rsync -av --exclude="node_modules" --exclude=".git" \
                        -e "ssh -o StrictHostKeyChecking=no" \
                        "AI BASED TALENT MANAGEMENT SYSTEM/frontend" \
                        itadmin@172.31.79.4:/tmp/
                        rsync -av \
                        -e "ssh -o StrictHostKeyChecking=no" \
                        "AI BASED TALENT MANAGEMENT SYSTEM/ai-service" \
                        itadmin@172.31.79.4:/tmp/
                    '''
                }
            }
        }
        stage('Deploy') {
            steps {
                sshagent(['ansible-ssh']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no itadmin@172.31.79.4 "
                            rsync -av /tmp/backend itadmin@172.31.83.90:/opt/talent/
                            rsync -av /tmp/frontend itadmin@172.31.83.90:/opt/talent/
                            rsync -av /tmp/ai-service itadmin@172.31.83.90:/opt/talent/
                        "
                    '''
                }
            }
        }
        stage('Build and Restart Containers') {
            steps {
                sshagent(['ansible-ssh']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no itadmin@172.31.79.4 "
                            ssh -o StrictHostKeyChecking=no itadmin@172.31.83.90 '
                                cd /opt/talent/frontend
                                docker build -t talent-frontend .
                                docker stop talent-frontend || true
                                docker rm talent-frontend || true
                                docker run -d --name talent-frontend --restart=always -p 8080:80 talent-frontend
                                cd /opt/talent/backend
                                docker build -t talent-backend .
                                docker stop talent-backend || true
                                docker rm talent-backend || true
                                docker run -d --name talent-backend --restart=always -p 5000:5000 --env-file .env talent-backend
                            '
                        "
                    '''
                }
            }
        }
    }
}
