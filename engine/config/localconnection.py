configuration = dict(
    mongo_conn = 'mongodb://eazyrecruit:klkjhgbvfcf@localhost:27019/admin',
    mongo_db = 'eazyrecruit',
    redis_host = 'redis://:klkjhgbvfcf@localhost:6379/0', 
    api_Url = 'http://localhost:8082/api'
)
def get_config():
    return configuration
