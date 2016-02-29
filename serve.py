#!/usr/bin/python
import BaseHTTPServer
import SimpleHTTPServer
import os
import os.path
import ssl
import subprocess
import sys

address = '0.0.0.0'
port = 8443

# Change to script directory for openssl keyfile generation.
os.chdir(os.path.dirname(os.path.realpath(sys.argv[0])))
keyfile = 'privkey.pem'
openssl = 'openssl req -new -x509 -days 10000 -nodes -out %s' % keyfile

if not os.path.isfile(keyfile):
  try:
    subprocess.call(openssl.split(' '))
  except:
    if os.path.isfile(keyfile):
      os.remove(keyfile)

httpd = BaseHTTPServer.HTTPServer((address, port), SimpleHTTPServer.SimpleHTTPRequestHandler)
httpd.socket = ssl.wrap_socket(httpd.socket, certfile=keyfile, server_side=True)
print('Listening on https://%s:%s' % (address, port))
httpd.serve_forever()

