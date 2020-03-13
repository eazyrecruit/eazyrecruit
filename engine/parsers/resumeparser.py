import os
import textract
import base64
import bson
import string
from mongoengine import *
import extractors.extracter as extracter
import nltk
from nltk.corpus import stopwords
from nltk.stem.snowball import SnowballStemmer
import csv
nltk.download('stopwords')
nltk.download('SnowballStemmer')
nltk.download('universal_tagset')

def parse(tempFileName):
    try:
        resume_string = textract.process(tempFileName)
        resume_string = str(resume_string, 'utf-8')
        if resume_string:
            user_data = getResumeData(resume_string)
            return resume_string, user_data
    except DoesNotExist as dberr:
        return None, {'error':'Resume not exist'}
    except Exception as ex:
        if ex.args:
            return ex.args, {'error': ex.args}
        else:
            return 'Error occured while parsing data', {'error': 'Error occured while parsing data'}
    finally:
        pass
        # if tempFileName and os.path.exists(tempFileName):
        #     os.remove(tempFileName)


"""
Utility function that cleans the resume_text.
Params: resume_text type: string
returns: cleaned text ready for processing
"""
def clean_resume(resume_text):
  cleaned_resume = []
  whitelist = set('abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ')
  # replacing newlines and punctuations with space
  #return resume_text.replace('\t', ' ').replace('\n', ' ')
  for punctuation in string.punctuation:
    resume_text = resume_text.replace(punctuation, ' ')
  resume_text = resume_text.split()
#   # removing stop words and Stemming the remaining words in the resume
  stemmer = SnowballStemmer("english")
  for word in resume_text:
    if word not in stopwords.words('english') and not word.isdigit():
      cleaned_resume.append(word.lower())  # stemmer.stem(word))
  cleaned_resume = ' '.join(cleaned_resume)
  cleaned_resume = ''.join(filter(whitelist.__contains__, cleaned_resume))
  return cleaned_resume


def getResumeData(resume_string):
    user_data = {}
    try:
        resume_string1 = resume_string
        cleanedResume = clean_resume(resume_string)
        #Removing commas in the resume for an effecient check
        resume_string = resume_string.replace(',', ' ')
        #Converting all the charachters in lower case
        #resume_string = resume_string.lower()
        # Extracting name from the resume string
        # user_data['job_positions'], user_data['job_category'] = extracter.extract_jobs(cleanedResume)
        # user_data['current_employers'], user_data['employers'] = extracter.extract_employers(resume_string, user_data['job_positions'])
        user_data['skills'] = extracter.extract_skills(cleanedResume)       
        user_data['experiences'] = extracter.extract_employers(resume_string)
        user_data['name'] = extracter.extract_name(resume_string1)
        user_data['phone'] = extracter.extract_phone_numbers(resume_string1)
        user_data['email'] = extracter.extract_email_addresses(resume_string1)
        user_data['address'] = extracter.extract_address(resume_string1)
        user_data['educations'] = extracter.extract_qualifications(resume_string1) 
        # if extracter.calculate_experience(resume_string1) < 0:
        #     user_data['experience'] = 0
        # else:
        #     extracter.calculate_experience(resume_string1)
        # user_data['extra_info'] = extracter.extract_extra(resume_string1)
    except Exception as ex:
        print('Unable to parse resume, error: ',ex)
    return user_data
