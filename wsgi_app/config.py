import socket
HOSTNAME = socket.gethostname()
if HOSTNAME == 'testvm':
    ENV = 'production'
else:
    ENV = 'development'

if ENV == 'production':
    DB_DIR = '/var/www/bases/'
else:
    DB_DIR = '/var/www/bases/'