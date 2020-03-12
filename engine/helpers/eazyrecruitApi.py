#!/usr/bin/env python
import requests
import config
import json
import config

class EazyrecruitAPI:

    def __init__(self):
        self.baseurl = config.get_config()['api_Url']
        # self.email = config['destEmail']
        # self.password = config['destPassword']


    def login(self):
        url = self.baseurl + '/account/login'
        userCredentials = {
            "userName": self.email,
            "password": self.password
        }
        response = requests.post(url, userCredentials)
        if (response.status_code == 200):
            responseJson = response.json()
            if(responseJson['success']):
                return responseJson['success']['data']['token']
            else:
                return


    def postData(self, data, url, token):
        url = self.baseurl + url
        #print("restapi_39", url)
        headers = {'Authorization': 'Bearer ' +
                token, 'Content-Type': 'application/json'}
        #print(headers)
        response = requests.post(url, data=data, headers=headers)
        if (response.status_code == 200):
            return response.json()
        else:
            return


    def uploadResumeWithData(self, attachment, data, url, token):
        try:
            bodyData = json.dumps(data)
            headers = {'Authorization': "Bearer "+token}
            multipart_form_data = {'resumeData': (
                attachment.split('/')[-1], open(attachment, 'rb'))}
            payload = {'body': json.dumps(data)}
            response = requests.post(self.baseurl + url, files=multipart_form_data, data=payload, headers=headers)
            if (response.status_code == 200):
                return response.json()
            else:
                return
        except Exception as err:
            print(err)