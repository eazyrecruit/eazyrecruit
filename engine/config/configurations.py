import os
configuration = dict(
    mongo_conn = os.environ['MONGO_URL'],
    mongo_db = os.environ['MONGO_DB'],
    redis_host = os.environ['REDIS_URL'],
    clientSecret=os.environ['CORE_CLIENT_SECRET'],
    api_Url = os.environ['CORE_SERVICE_PATH'],
    node_decryption_iv = os.environ['NODE_DECRYPTION_IV'],
    node_decryption_key = os.environ['NODE_DECRYPTION_KEY']
)
def get_config():
    return configuration
