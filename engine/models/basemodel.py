from pymongo import MongoClient
import pymongo
import config
conn = config.get_config()['mongo_conn']

class BaseModel:

    def __init__(self):
        self.mongoClient = MongoClient(conn)

    def __del__(self):
        if self.mongoClient: 
            self.mongoClient.close()

    def EazyrecruitDB(self):
        if self.mongoClient:
            return self.mongoClient[config.get_config()['mongo_db']]