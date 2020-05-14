# set the base image 
FROM akeodocker/python3.5:v1

#installing required packages

RUN python -m nltk.downloader punkt
RUN python -m nltk.downloader stopwords
# RUN python -m nltk.downloader universal_tagset

RUN apt-get update -y

RUN python -m spacy download xx_ent_wiki_sm 
RUN python -m spacy download en_core_web_sm

#set directoty where CMD will execute 
WORKDIR /usr/src/app

#Installing depandancies
COPY ./engine/requirements.txt .
RUN pip install -r requirements.txt

# Project copy 
COPY ./engine .

# Expose ports
EXPOSE 8000

# default command to execute 
CMD [ "gunicorn", "api.wsgi:application", "--bind","0.0.0.0:8000", "--workers", "3" ]