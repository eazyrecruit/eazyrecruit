from celery import Celery
from parsers import emailparser as MailParser, resumeparser as ResumeParser, dbparser as DbParser
from pathlib import Path
import os
import time
import base64
import glob
import subprocess
from helpers.eazyrecruitApi import EazyrecruitAPI
import json
import config
import data.skills.scraping_skills as skillsScraper
from models.resumemodel import ResumeModel

app = Celery('tasks', broker=config.get_config()['redis_host'])

@app.on_after_configure.connect
def emailparser_job(sender, **kwargs):
    sender.add_periodic_task(20.0, emailparser_task.s(), name='add every 20')

@app.task(name="emailparser")
def emailparser_task():
    listFiles = MailParser.parse()
    if listFiles and len(listFiles) > 0:
        for index in range(len(listFiles)):
            resumeparser_task.delay(listFiles[index]['tempFile'], listFiles[index]['fileName'], '', 'email')

@app.task(name="dbreparser")
def dbreparser_task():
    resumemodel = ResumeModel()
    totalResumeCount = resumemodel.getTotalCount()
    print(totalResumeCount)
    pageSize = 50
    pageCount = int(totalResumeCount/pageSize) + 1
    pageIndex = 0
    for pageIndex in range(pageCount):
        limit = totalResumeCount - (pageIndex * pageSize) if totalResumeCount < (pageIndex + 1) * pageSize else pageSize
        listFiles = DbParser.parse(pageIndex * pageSize, limit)
        if listFiles and len(listFiles) > 0:
            for file in listFiles:
                resumeparser_task.delay(file['tempFile'], file['fileName'], file['resumeId'], 'db')
        pageIndex = pageIndex + 1

@app.task(name="dbparser")
def dbparser_task(resumeId):
    file = DbParser.parseById(resumeId)
    if file:
        resumeparser_task.delay(file['tempFile'], file['fileName'], file['resumeId'], 'upload')

@app.task(name="resumeparser")
def resumeparser_task(tempFile, fileName, resumeId, source):
    try:
        print(tempFile)
        eazyrecruitAPI = EazyrecruitAPI()
        resume_text, data = ResumeParser.parse(tempFile)
        if data:
            data['resume'] = {'file': fileName, 'id': resumeId}
            #this token is valid for 10 years from 8 Apr, 2020
            token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlOGM0NTcxYmNhNjZkZWMxMmUwOTliMyIsImVtYWlsIjoidmlja3lAYWtlby5ubyIsInJvbGVzIjpbXSwiaWF0IjoxNTg2MzM5MDQyLCJleHAiOjE5MDE2OTkwNDIsImF1ZCI6IkVhenlSZWNydWl0VXNlcnMiLCJpc3MiOiJodHRwczovL2Rldi1hcGkuZWF6eXJlY3J1aXQuaW4ifQ.J1RhGZwarEhhFreOc91NK9Ag9Gfa3GCc8YLfH15Frls"
            eazyrecruitAPI.uploadResumeWithData( tempFile, data, "/applicant", token)
    except Exception as xf:
        print(xf)
    finally:
        if tempFile and os.path.exists(tempFile):
            os.remove(tempFile)

# @app.on_after_configure.connect
# def owncloudparser_job(sender, **kwargs):
#     sender.add_periodic_task(3600, owncloudparser_task.s())

# @app.task
# def dbparser_task():
#     while True:
#         last_index = dbstatusmodel.get_latest_index() + 1
#         users = dbstatusmodel.get_records(last_index, 10)
#         if users is not None:
#             for user in users:
#                 usermodel.save(user)
#         dbstatusmodel.save_latest_index(last_index+9)
#         print(last_index+9)

# @app.task
# def odoodata_task():
#     connectxmlrpc.odoodata()

#{'success': {'data': 'success'}}
#data.get('resumes', None)[0]['content']
#emailparser_task.delay()
#dbreparser_task()
#dbparser_task("5e3fbe262d6dff65a35408be")
#owncloudparser_task.delay()
# odoodata_task.delay()
#skillsScraper.dump_skill_list("./data/skills/linkedinskill.list")
#resumeparser_task("./dump/d20374726a2546db87a0b45dd0684fd1.pdf", "AbhishekSharmaResume.pdf", '', 'email')

app.conf.beat_schedule = {
    "check-mail-every-hour": {
        "task": "tasks.emailparser_task",
        "schedule": 3600
    }
}