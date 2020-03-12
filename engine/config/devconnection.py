import os

obj = dict(
    mongo_conn = os.environ['MONGO_URL'],
    mongo_db = os.environ['MONGO_DB'],
    redis_host = os.environ['REDIS_URL'],
    api_Url = os.environ['API_URL'],
)
def get_config():
    return obj
