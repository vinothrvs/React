pipeline {
    agent any
    environment {
        ANSIBLE_HOST = '172.31.79.4'
    }
    stages {
        stage('Pull Code') {
            steps {
                checkout scm  // Pull latest code from GitHub
            }
        }
        stage('Copy to Ansible') {
            steps {
                sshagent(['ansible-ssh']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no itadmin@${ANSIBLE_HOST} 'rm -rf /tmp/react-app'
                        scp -o StrictHostKeyChecking=no -r frontend/Dockerfile itadmin@${ANSIBLE_HOST}:/tmp/
                        scp -o StrictHostKeyChecking=no -r frontend/src itadmin@${ANSIBLE_HOST}:/tmp/
                        scp -o StrictHostKeyChecking=no -r frontend/public itadmin@${ANSIBLE_HOST}:/tmp/
                        scp -o StrictHostKeyChecking=no frontend/package*.json itadmin@${ANSIBLE_HOST}:/tmp/
                    """
                }
            }
        }
        stage('Deploy') {
            steps {
                sshagent(['ansible-ssh']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no itadmin@${ANSIBLE_HOST} '
                            ansible all -i /opt/project/hosts -m file -a "path=/opt/talent/react-app state=directory mode=0755 owner=itadmin group=itadmin" --become
                            ansible all -i /opt/project/hosts -m copy -a "src=/tmp/Dockerfile dest=/opt/talent/react-app/"
                            ansible all -i /opt/project/hosts -m copy -a "src=/tmp/src dest=/opt/talent/react-app/"
                            ansible all -i /opt/project/hosts -m copy -a "src=/tmp/public dest=/opt/talent/react-app/"
                            ansible all -i /opt/project/hosts -m copy -a "src=/tmp/package.json dest=/opt/talent/react-app/"
                            ansible all -i /opt/project/hosts -m copy -a "src=/tmp/package-lock.json dest=/opt/talent/react-app/"
                            ansible all -i /opt/project/hosts -m shell -a "cd /opt/talent/react-app && docker build -t react-app ."
                            ansible all -i /opt/project/hosts -m shell -a "docker stop react-app || true"
                            ansible all -i /opt/project/hosts -m shell -a "docker rm react-app || true"
                            ansible all -i /opt/project/hosts -m shell -a "docker run -d --name react-app -p 3000:80 react-app"
                        '
                    """
                }
            }
        }
    }
}
