"The ni Common Environment"

GOOGLE  = 'Google App Engine'
TORNADO_MONGO = 'Tornado Web Server with MongoDB'

from app import main
from web import add_url as url
from orm import Field as persist, Model

urls = {}
