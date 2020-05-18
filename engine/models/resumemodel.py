from pymongo import MongoClient
import pymongo
import datetime
from bson import ObjectId
from models.basemodel import BaseModel

class ResumeModel(BaseModel):

    def __init__(self):
        super().__init__()

    def getAll(self, skip, count):
        db = super().EazyrecruitDB()
        resumes = db.applicantresumes.find().skip(skip).limit(count)
        return resumes

    def getById(self, resumeId):
        db = super().EazyrecruitDB()
        return db.applicantresumes.find_one({"_id": ObjectId(resumeId)})

    def getTotalCount(self):
        db = super().EazyrecruitDB()
        return db.applicantresumes.find().count()