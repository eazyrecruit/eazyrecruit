import os

try:
    if os.environ['DJANGO_DEVELOPMENT']=='prod':
        from config.prodconnection import *
    elif os.environ['DJANGO_DEVELOPMENT']=='dev':
        from config.devconnection import *
    else:
        from config.localconnection import *
except Exception as e:
    print(e)
    from config.localconnection import *


