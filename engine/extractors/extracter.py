import re
import spacy
from bs4 import BeautifulSoup
import urllib.request
import pickle
from nltk.tokenize import sent_tokenize
import string
import helpers.configurations as regex
import helpers.utilities as utilities
from collections import Counter
from nltk.tokenize import TweetTokenizer
#import os
import csv
#import numpy as np
import nltk
#from nltk.tag.stanford import StanfordNERTagger
from nltk.corpus import stopwords
#from nltk.stem.snowball import SnowballStemmer

# Function to extract names from the string using nltk


def extract_name(resume_text):
    sent_list = sent_tokenize(resume_text)
    for sent in sent_list:
        for sent_part in sent.split("\n"):
            if any(word in sent_part.lower().strip() for word in ['curriculam', 'vitae', 'bio-data', 'resume']):
                pass
            else:
                return sent_part
    # nlp = spacy.load('xx_ent_wiki_sm')
    # doc = nlp(resume_text)
    # for ent in doc.ents:
    #     if(ent.label_ == 'PER'):
    #         return ent.text

# Function to extract Phone Numbers from string using regular expressions


def extract_phone_numbers(resume_text):
    r = re.compile(
        r'(\d{3}[-\.\s]??\d{3}[-\.\s]??\d{4}|\(\d{3}\)\s*\d{3}[-\.\s]??\d{4}|\d{3}[-\.\s]??\d{4})')
    phone_numbers = r.findall(resume_text)
    y = [re.sub(r'\D', '', number) for number in phone_numbers]
    y1 = []
    for i in range(len(y)):
        if(len(y[i]) > 9):
            y1.append(y[i])
    return y1


# Function to extract Email address from a string using regular expressions
def extract_email_addresses(resume_text):
    try:
        regular_expression = re.compile(regex.email, re.IGNORECASE)
        emails = []
        result = re.search(regular_expression, resume_text)
        while result:
            emails.append(result.group())
            resume_text = resume_text[result.end():]
            result = re.search(regular_expression, resume_text)
            return emails
    except Exception as exception_instance:
        return exception_instance
    return []

# Function to extract Email address from a string using regular expressions


def extract_skills(resume_text):
    resume_text = resume_text.lower()
    skill_string = ''
    # sugested_job_position = []
    # tknzr = TweetTokenizer()
    with open('data/skills/skills', 'rb') as fp:
        skills = pickle.load(fp)
    skill_set = []
    for skill in skills:
        if skill.lower() in resume_text:
            #skill_string = skill_string + skill
            skill_set.append(skill)
    #fdist = Counter(tknzr.tokenize(skill_string))
    # for word, frequency in fdist.most_common(2):
    #     sugested_job_position.append(word)
        # print(u'{};{}'.format(word, frequency))
    # return skill_set, sugested_job_position
    return skill_set


# Information Extraction Function
def extract_information(resume_text):
    resume_text.replace(" ", "+")
    query = resume_text
    soup = BeautifulSoup(urllib.request.urlopen("https://en.wikipedia.org/wiki/" + query), "html.parser")
    # creates soup and opens URL for Google. Begins search with site:wikipedia.com so only wikipedia
    # links show up. Uses html parser.
    for item in soup.find_all('div', attrs={'id': "mw-content-text"}):
        print(item.find('p').get_text())
        print('\n')


def extract_address(resume_text):
    pincode_input_path = 'data/address/pincodes'
    address_input_path = 'data/address/pincode-district-state'
    states_input = 'data/address/states'
    district_state_input = 'data/address/district-states'
    pincodes = set()
    states = set()
    district_states = {}
    address = {}
    result_address = {}
    initial_resume_text = resume_text

    with open(pincode_input_path, 'rb') as fp:
        pincodes = pickle.load(fp)
    with open(address_input_path, 'rb') as fp:
        address = pickle.load(fp)

    regular_expression = re.compile(regex.pincode)
    regex_result = re.search(regular_expression, resume_text)
    while regex_result:
        useful_resume_text = resume_text[:regex_result.start()].lower()
        pincode_tuple = regex_result.group()
        pincode = ''
        for i in pincode_tuple:
            if (i <= '9') and (i >= '0'):
                pincode += str(i)
        if pincode in pincodes:
            result_address['zip'] = pincode
            result_address['state'] = address[pincode]['state'].title()
            result_address['city'] = address[pincode]['district'].title()
            return result_address

        result_address.clear()
        resume_text = resume_text[regex_result.end():]
        regex_result = re.search(regular_expression, resume_text)

    resume_text = initial_resume_text.lower()

    with open(states_input, 'rb') as fp:
        states = pickle.load(fp)
    with open(district_state_input, 'rb') as fp:
        district_states = pickle.load(fp)

    # Check if the input is a separate word in resume_text
    def if_separate_word(pos, word):
        if (pos != 0) and resume_text[pos-1].isalpha():
            return False
        final_pos = pos+len(word)
        if (final_pos != len(resume_text)) and resume_text[final_pos].isalpha():
            return False
        return True

    result_state = ''
    state_pos = len(resume_text)
    result_district = ''
    district_pos = len(resume_text)
    for state in states:
        pos = resume_text.find(state)
        if (pos != -1) and (pos < state_pos) and if_separate_word(pos, state):
            state_pos = pos
            result_state = state
    for district in district_states.keys():
        pos = resume_text.find(district)
        if (pos != -1) and (pos < district_pos) and if_separate_word(pos, district):
            district_pos = pos
            result_district = district
    if (result_state is '') and (result_district is not ''):
        result_state = district_states[result_district]

    result_address['zip'] = ''
    result_address['city'] = result_district.title()
    result_address['state'] = result_state.title()
    return result_address


def calculate_experience(resume_text):
    def get_month_index(month):
        month_dict = {'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6, 'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12}
        return month_dict[month.lower()]
    try:
        experience = 0
        start_month = -1
        start_year = -1
        end_month = -1
        end_year = -1
        regular_expression = re.compile(regex.date_range, re.IGNORECASE)
        regex_result = re.search(regular_expression, resume_text)
        while regex_result:
            date_range = regex_result.group()
            year_regex = re.compile(regex.year)
            year_result = re.search(year_regex, date_range)
            if (start_year == -1) or (int(year_result.group()) <= start_year):
                start_year = int(year_result.group())
                month_regex = re.compile(regex.months_short, re.IGNORECASE)
                month_result = re.search(month_regex, date_range)
                if month_result:
                    current_month = get_month_index(month_result.group())
                    if (start_month == -1) or (current_month < start_month):
                        start_month = current_month
            if date_range.lower().find('present') != -1:
                end_month = date.today().month  # current month
                end_year = date.today().year  # current year
            else:
                year_result = re.search(year_regex, date_range[year_result.end():])
                if (end_year == -1) or (int(year_result.group()) >= end_year):
                    end_year = int(year_result.group())
                    month_regex = re.compile(regex.months_short, re.IGNORECASE)
                    month_result = re.search(month_regex, date_range)
                    if month_result:
                        current_month = get_month_index(month_result.group())
                        if (end_month == -1) or (current_month > end_month):
                            end_month = current_month
            resume_text = resume_text[regex_result.end():]
            regex_result = re.search(regular_expression, resume_text)

        return end_year - start_year  # Use the obtained month attribute
    except Exception as exception_instance:
        return 'Issue calculating experience: '+str(exception_instance)


"""
Utility function that fetches Job Position from the resume.
Params: cleaned_resume Type: string
returns: job_positions Type:List"""


def extract_jobs(cleaned_resume):
    positions_path = 'data/job_positions/positions'
    with open(positions_path, 'rb') as fp:
        jobs = pickle.load(fp)
    job_positions = []
    positions = []
    for job in jobs.keys():
        job_regex = r'[^a-zA-Z]'+job+r'[^a-zA-Z]'
        regular_expression = re.compile(job_regex, re.IGNORECASE)
        regex_result = re.search(regular_expression, cleaned_resume)
        if regex_result:
            positions.append(regex_result.start())
            job_positions.append(job.capitalize())
    job_positions = [job for (pos, job) in sorted(zip(positions, job_positions))]
    # For finding the most frequent job category
    hash_jobs = {}
    for job in job_positions:
        if jobs[job.lower()] in hash_jobs.keys():
            hash_jobs[jobs[job.lower()]] += 1
        else:
            hash_jobs[jobs[job.lower()]] = 1
    # To avoid the "Other" category and 'Student' category from
    # becoming the most frequent one.
    if 'Student' in hash_jobs.keys():
        hash_jobs['Student'] = 0
    hash_jobs['Other'] = -1
    return job_positions  # (, max(hash_jobs, key=hash_jobs.get).capitalize())


"""
Utility function that fetches degree and degree-info from the resume.
Params: resume_text Type: string
returns:
degree Type: List of strings
info Type: List of strings
"""


def extract_qualifications(resume_text):
    degree_path = 'data/qualifications/degree'
    with open(degree_path, 'rb') as fp:
        qualifications = pickle.load(fp)
    degrees = []
    for qualification in qualifications:
        degree = {}
        qual_regex = r'[^a-zA-Z]'+qualification+r'[^a-zA-Z]'
        regular_expression = re.compile(qual_regex, re.IGNORECASE)
        regex_result = re.search(regular_expression, resume_text)
        while regex_result:
            degree['degree'] = qualification
            degree['info'] = []
            resume_text = resume_text[regex_result.end():]
            lines = [line.rstrip().lstrip()
                     for line in resume_text.split('\n') if line.rstrip().lstrip()]
            if lines:
                degree['info'].append(lines[0])
            regex_result = re.search(regular_expression, resume_text)
            degrees.append(degree)
    return degrees


"""
Util function for fetch_employers module to get employers
All organizations found near any job position is regarded as an employer
Params: resume_text Type:String
        job_positions Type: List of Strings
        organizations Type: List of Strings
        priority Type: Boolean True/False
Output: current_employers Type: List of strings
        all_employers Type: List of strings
"""


def fetch_employers_util(resume_text, job_positions, organizations):
    employers = []
    for job in job_positions:
        employer = {}
        job_regex = r'[^a-zA-Z]'+job+r'[^a-zA-Z]'
        regular_expression = re.compile(job_regex, re.IGNORECASE)
        temp_resume = resume_text
        regex_result = re.search(regular_expression, temp_resume)
        while regex_result:
            # start to end point to a line before and after the job positions line
            # along with the job line
            start = regex_result.start()
            end = regex_result.end()
            lines_front = utilities.LINES_FRONT
            lines_back = utilities.LINES_BACK
            while lines_front != 0 and start != 0:
                if temp_resume[start] == '.':
                    lines_front -= 1
                start -= 1
            while lines_back != 0 and end < len(temp_resume):
                if temp_resume[end] == '.':
                    lines_back -= 1
                end += 1
            # Read from temp_resume with start and end as positions
            line = temp_resume[start:end].lower()
            for org in organizations:
                if org.lower() in line and org.lower() not in job_positions:
                    employer['company'] = org
                    employers.append(employer)
            temp_resume = temp_resume[end:]
            regex_result = re.search(regular_expression, temp_resume)
    return employers


"""
Utility function that fetches the employers from resume
Params: resume_text Type: String
        job_positions Type: List of Strings
returns: employers Type: List of string
"""


def extract_employers(resume_text):
    # Cleaning up the text.
    # 1. Initially convert all punctuations to '\n'
    # 2. Split the resume using '\n' and add non-empty lines to temp_resume
    # 3. join the temp_resume using dot-space
    job_positions = extract_jobs(resume_text)
    for punctuation in string.punctuation:
        resume_text = resume_text.replace(punctuation, '\n')
    temp_resume = []
    for x in resume_text.split('\n'):
        # append only if there is text
        if x.rstrip():
            temp_resume.append(x)
    # joined with dot-space
    resume_text = '. '.join(temp_resume)
    employers = []
    emps = fetch_employers_util(resume_text, job_positions, utilities.get_organizations())
    employers.extend(emps)
    # emps = fetch_employers_util(resume_text, job_positions, fetch_all_organizations(resume_text))
    # employers.extend([emp for emp in emps if emp not in employers])
    return employers


"""

Utility function that fetches extra information from the resume.
Params: resume_text Type: string
returns: extra_information Type: List of strings

"""


def extract_extra(resume_text):
    with open('data/extra/extra', 'rb') as fp:
        extra = pickle.load(fp)

    extra_information = []
    for info in extra:
        extra_regex = r'[^a-zA-Z]'+info+r'[^a-zA-Z]'
        regular_expression = re.compile(extra_regex, re.IGNORECASE)
        regex_result = re.search(regular_expression, resume_text)
        while regex_result:
            extra_information.append(info)
            resume_text = resume_text[regex_result.end():]
            regex_result = re.search(regular_expression, resume_text)
    return extra_information


def extract_roles(resume_text):
    filename = 'data/unique_roles.csv'
    matched_roles = []
    with open(filename, 'r') as csvfile:
        csvreader = csv.reader(csvfile)
        for rows in csvreader:
            role_regex = r'[^a-zA-Z]'+str(rows[0])+r'[^a-zA-Z]'
            regular_expression = re.compile(role_regex, re.IGNORECASE)
            regex_result = re.search(regular_expression, resume_text)

            if(regex_result):
                matched_roles.append(rows[0])

    return matched_roles
