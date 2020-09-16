#!/bin/bash

docker stop resume-app
docker rm resume-app
docker rmi app/resume

docker build -t app/resume .
sudo docker run --name resume-app -d -it -p 8000:8000 app/resume
