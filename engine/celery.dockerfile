# set the base image 
FROM akeodocker/python3.5:v1
#add project files to the usr/src/app folder
ADD . /usr/src/app
#set directoty where CMD will execute 
WORKDIR /usr/src/app
#Environment variable
#ENV LC_ALL=en_US.UTF-8
#ENV LANG=en_US.UTF-8

# Get pip to download and install requirements:
RUN apt-get update -y
#RUN python -m pip install --upgrade pip setuptools wheel
#RUN apt-get install -y -qq libxml2-dev libxslt1-dev antiword unrtf poppler-utils pstotext tesseract-ocr gcc swig python-dev build-essential git libpulse-dev default-libmysqlclient-dev libasound2-dev libtool flac ffmpeg lame libmad0 libsox-fmt-mp3 sox libjpeg-dev
#RUN autoconf bison
#RUN locale-gen en_US.UTF-8
RUN pip install --no-cache-dir -r requirements.txt
RUN python -m nltk.downloader punkt
RUN python -m nltk.downloader stopwords
RUN python -m spacy download xx_ent_wiki_sm
RUN python -m spacy download en_core_web_sm

# Expose ports
#EXPOSE 8000
# default command to execute 
ENTRYPOINT [ "celery", "worker", "-A", "tasks", "-B", "-s", "/usr/src/celery"]
