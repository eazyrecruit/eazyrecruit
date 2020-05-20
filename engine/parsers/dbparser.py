import base64
from pathlib import Path
import config
import os
import uuid
from models.resumemodel import ResumeModel

def parse(skip, count):
    resumemodel = ResumeModel()
    resumeFiles = []
    resumes = resumemodel.getAll(skip, count)
    if resumes is not None:
        for resume in resumes:
            if isValidFormat(resume['fileType'], resume['fileName']):
                resume_64_decode = base64.b64decode(resume['resume'])
                tempFileName = './dump/'+ uuid.uuid4().hex + os.path.splitext(resume['fileName'])[1]
                try:
                    with open(tempFileName, 'wb') as nf:
                        nf.write(resume_64_decode)
                    resumeFiles.append({'tempFile': tempFileName, 'fileName': resume.get('fileName'), 'resumeId': str(resume.get('_id'))})
                except:
                    print("error while parseing resume " + resume['_id'])
                    if tempFileName and os.path.exists(tempFileName):
                        os.remove(tempFileName)
    return resumeFiles

def parseById(resumeId):
    try:
        resumemodel = ResumeModel()
        resume = resumemodel.getById(resumeId) 
        tempFileName=None 
        if resume and isValidFormat(resume['fileType'], resume['fileName']):
            tempFileName = './dump/'+ uuid.uuid4().hex + os.path.splitext(resume['fileName'])[1]
            resume_64_decode = base64.b64decode(resume['resume'])
            with open(tempFileName, 'wb') as nf:
                nf.write(resume_64_decode)
        return {'tempFile': tempFileName, 'fileName': resume.get('fileName'), 'resumeId': str(resume.get('_id'))}
    except Exception as ex:
        print("could not fetch " + ex)


def isValidFormat(type, fileName):
    supportedFormats = [
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/pdf",
        #"application/rtf",
        #"image/jpeg",
        #"text/rtf",
        "application/vnd.oasis.opendocument.text"
    ]
    if type in supportedFormats and len(os.path.splitext(fileName)[1]) > 0:
        return True
    return False
