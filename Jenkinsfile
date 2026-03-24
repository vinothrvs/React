pipeline {
    agent any
    environment {
        ANSIBLE_HOST = '172.31.79.4'
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
                    sh "scp -o StrictHostKeyChecking=no -r . itadmin@${ANSIBLE_HOST}:/tmp/react-app"
                }
            }
        }
        stage('Deploy') {
            steps {
                sshagent(['ansible-ssh']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no itadmin@${ANSIBLE_HOST} '
                            ansible all -i /opt/project/hosts -m copy -a "src=/tmp/react-app dest=/opt/talent/"
                            ansible all -i /opt/project/hosts -m shell -a "cd /opt/talent/react-app/frontend && docker build -t react-app ."
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
