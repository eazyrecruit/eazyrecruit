configuration = dict(
    mongo_conn = 'mongodb://coreeazyrecruit:eazyrecruitcore123@192.168.1.46/eazyrecruit',
    mongo_db = 'eazyrecruit',
    redis_host = 'redis://localhost:6379',
    api_Url = 'http://localhost:8082/api'
)
def get_config():
    return configuration
