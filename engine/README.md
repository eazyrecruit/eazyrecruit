# eazyrecruit-engine
pre-requisite - 
    python 3.5 with pip
    For Ubuntu - 
        sudo apt-get install -y python3.5-dev build-essential swig git libpulse-dev libmysqlclient-dev libtool gcc automake locales
        autoconf bison
    For Mac - 
        1. Install brew
        2. brew cask install xquartz
        3. brew install poppler antiword unrtf tesseract gcc automake autoconf libtool bison swig

1. pip install -r requirements.txt
2. python -m spacy download en_core_web_sm
3. python -m spacy download xx_ent_wiki_sm
4. download nltk - (start python shell and following following steps)
    import nltk
    nltk.download('punkt')

Quick-fixes - 
    export LC_ALL=en_US.UTF-8
    export LANG=en_US.UTF-8

# Run celery beat 
celery worker -A tasks -B

##########
docker build -f celery.dockerfile -t eazyrecruit-celery .
docker-compose -f docker.compose.yaml up -d

#########
docker build -t eazyrecruit .
sudo docker run -p 8000:8000 -v /home/eazyrecruit/eazyrecruit-engine/:/usr/src/app -d --name eazyrecruit eazyrecruit:latest



###################
sudo docker build -t ez-engine .