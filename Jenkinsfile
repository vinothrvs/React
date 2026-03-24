pipeline {
    agent any
    environment {
        ANSIBLE_HOST = '172.31.79.4'
        DOCKER_HOST  = '172.31.83.90'
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
                        # ✅ Fixed: removed wrong "AI BASED TALENT MANAGEMENT SYSTEM/" prefix
                        rsync -av --exclude="node_modules" --exclude=".git" \
                            -e "ssh -o StrictHostKeyChecking=no" \
                            backend/ itadmin@${ANSIBLE_HOST}:/tmp/backend/

                        rsync -av --exclude="node_modules" --exclude=".git" \
                            -e "ssh -o StrictHostKeyChecking=no" \
                            frontend/ itadmin@${ANSIBLE_HOST}:/tmp/frontend/

                        rsync -av --exclude="node_modules" --exclude=".git" \
                            -e "ssh -o StrictHostKeyChecking=no" \
                            ai-service/ itadmin@${ANSIBLE_HOST}:/tmp/ai-service/
                    '''
                }
            }
        }

        stage('Deploy') {
            steps {
                sshagent(['ansible-ssh']) {
                    sh '''
                        # ✅ Fixed: added -A for SSH agent forwarding so rsync works from Ansible → Docker
                        ssh -A -o StrictHostKeyChecking=no itadmin@${ANSIBLE_HOST} "
                            rsync -av /tmp/backend/  itadmin@${DOCKER_HOST}:/opt/talent/backend/
                            rsync -av /tmp/frontend/ itadmin@${DOCKER_HOST}:/opt/talent/frontend/
                            rsync -av /tmp/ai-service/ itadmin@${DOCKER_HOST}:/opt/talent/ai-service/
                        "
                    '''
                }
            }
        }

        stage('Build and Restart Containers') {
            steps {
                sshagent(['ansible-ssh']) {
                    sh '''
                        # ✅ Fixed: added -A for agent forwarding, added ai-service build & run
                        ssh -A -o StrictHostKeyChecking=no itadmin@${ANSIBLE_HOST} "
                            ssh -o StrictHostKeyChecking=no itadmin@${DOCKER_HOST} '

                                # --- Frontend ---
                                cd /opt/talent/frontend
                                docker build -t talent-frontend .
                                docker stop talent-frontend || true
                                docker rm talent-frontend || true
                                docker run -d --name talent-frontend --restart=always -p 8080:80 talent-frontend

                                # --- Backend ---
                                cd /opt/talent/backend
                                docker build -t talent-backend .
                                docker stop talent-backend || true
                                docker rm talent-backend || true
                                docker run -d --name talent-backend --restart=always -p 5000:5000 --env-file .env talent-backend

                                # --- AI Service ---
                                cd /opt/talent/ai-service
                                docker build -t talent-ai-service .
                                docker stop talent-ai-service || true
                                docker rm talent-ai-service || true
                                docker run -d --name talent-ai-service --restart=always -p 8000:8000 talent-ai-service

                            '
                        "
                    '''
                }
            }
        }
    }
}
