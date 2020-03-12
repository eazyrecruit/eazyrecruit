from pymongo import MongoClient
import mysql.connector
import pymongo
import datetime
from dateutil import parser as DateParser
from bson import ObjectId
from extractors import extracter
from models.basemodel import BaseModel


class JobStatusModel(BaseModel):

    def __init__(self):
        super().__init__()

    def save_latest(self, job, last_index):
        id = ObjectId()
        db = super().EazyrecruitDB()
        jstatus = db.jobstatus.find_one({'job': job})
        if jstatus:
            db.jobstatus.update({'_id': jstatus['_id']},
                {'$set': {'last_index': last_index, 'date': datetime.datetime.now()}})
        else:
            db.jobstatus.insert(
                {'_id': id, 'job': job, 'last_index': last_index, 'date': datetime.datetime.now()})

    def get_latest(self, job):
        db = super().EazyrecruitDB()
        if db.jobstatus.find({'job': job}).count() > 0:
            recent_mail = db.jobstatus.find({'job': job}).sort(
                'date', pymongo.DESCENDING).limit(1)
            return recent_mail[0]['last_index']
        else:
            return 1

    def get_parsed_data(self, email, linked):
        db = super().EazyrecruitDB()
        if email is not None:
            suser = db.testimport.find_one({'email': email})
            if suser:
                return suser
        if linked is not None:
            suser = db.testimport.find_one({'linkedin': linked})
            if suser:
                return suser
        return None

    def getdumpedprofile(self, dpid):
        db = super().EazyrecruitDB()
        suser = db.dumpedprofiles.find_one({'id': dpid})
        if suser:
            return suser
        return None

    def parseDates(experience):
        dates = None
        try:
            if experience.get('period', None) is not None:
                dates = experience['period'].split('–')
            if experience.get('dates', None) is not None:
                dates = experience['dates'].split('–')
            if dates:
                experience['start'] = dates[0].strip()
                experience['end'] = dates[1].strip()
        except Exception as ex:
            print(ex)
        return experience


# def get_records(startindex, records):
#     cnx = mysql.connector.connect(user='chipmunk', password='chipmunk123', host='192.168.1.67', database='chipmunk')
#     users = []
#     try:
#         cursor = cnx.cursor()
#         query = "SELECT email,name,title,linkedin,profile,qualification,phone,location,experience,id FROM dumped_profiles ORDER BY id LIMIT "+ str(startindex)+', '+ str(records)
#         cursor.execute(query)
#         for user in cursor:
#             suser = {
#                 'email': [user[0]],
#                 'name': user[1],
#                 'title': user[2],
#                 'skills': extracter.extract_skills(user[2]),
#                 'socials': { 'linkedin': user[3], 'openrecruiter': user[4]},
#                 'educations': [{'degree' : user[5]}],
#                 'phone': [user[6]],
#                 'addresses': [user[7]],
#                 'exp_start': user[8],
#                 'experiences': [],
#                 'addresses': []
#             }
#             profile = getdumpedprofile(user[9])
#             if profile:
#                 # Summary
#                 summaryskills = []
#                 if profile.get('summary', None) is not None:
#                     suser['summary'] = profile['summary']
#                     summaryskills = extracter.extract_skills(profile['summary'])
#                 # Skills
#                 if profile.get('skills', None) is not None:
#                     suser['skills'].extend(profile['skills'])
#                     suser["skills"].extend(summaryskills)
#                 # Experiences
#                 if profile.get('experiences', None) is not None:
#                     exp_start = None
#                     for experience in profile['experiences']:
#                         experience = parseDates(experience)
#                         if experience.get('start', None) is not None:
#                             if exp_start is None or DateParser.parse(experience['start']) < DateParser.parse(exp_start):
#                                 exp_start = experience['start']
#                         suser['experiences'].append(experience)
#                     if exp_start:
#                         suser['exp_start'] = DateParser.parse(exp_start).replace(day=1)
#                 # Educations
#                 if profile.get('educations', None) is not None:
#                     for education in profile['educations']:
#                         suser['educations'].append(parseDates(education))
#                 # Addresses
#                 if profile.get('location', None) is not None:
#                     suser['addresses'].append(profile['location'])
#             users.append(suser)
#         cursor.close()
#         return users
#     except Exception as e:
#         print('exception:', e)
#     finally:
#         cnx.close()
