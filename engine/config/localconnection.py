import os
configuration = dict(
    # mongo_conn = 'mongodb://eazyrecruit:klkjhgbvfcf@localhost:27019/admin',
    # mongo_db = 'admin',
    # redis_host = 'redis://:klkjhgbvfcf@localhost:6379/0', 
    # api_Url = 'http://localhost:8082/api',
    # node_decryption_iv = 'cattmbworqqehaoq',
    # node_decryption_key = 'axiwhdscmzundjrlxwmjxoofvpquspku'

    mongo_conn = os.environ['MONGO_URL'],
    mongo_db = os.environ['MONGO_DB'],
    redis_host = os.environ['REDIS_URL'],
    api_Url = os.environ['CORE_SERVICE_PATH'],
    node_decryption_iv = os.environ['NODE_DECRYPTION_IV'],
    node_decryption_key = os.environ['NODE_DECRYPTION_KEY']
)
def get_config():
    return configuration
