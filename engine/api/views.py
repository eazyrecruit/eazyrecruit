from django.shortcuts import render, redirect
from django.core.files.storage import FileSystemStorage
from django.http import JsonResponse
import os
from rest_framework.decorators import api_view
from parsers import resumeparser as ResumeParser
import requests
import json

def post_data_to_core(file_path, payload, auth_token):
    try:
        url = os.environ['CORE_SERVICE_PATH'] + "/api/applicant"
        # print(url)
        payload = payload
        files = [('resume', open(file_path,'rb'))]
        headers = {'Authorization': auth_token}
        response = requests.request("POST", url, headers=headers, data = payload, files = files)
        # print("17",response)
        return json.loads(response.text) 
    except:
        print("error occured")
   

@api_view(['GET', 'POST'])
def resume(request):
    res={}
    # print("views.py 22")
    if request.method == 'POST' and request.FILES['resumeData']:
        # print("views.py 24")
        try:
            myfile = request.FILES['resumeData']
            fs = FileSystemStorage()
            tempFile = fs.save(myfile.name, myfile)
            savedFilePath = os.getcwd()+"/media/"+tempFile
            resume_text, data = ResumeParser.parse(savedFilePath)
            # print(request.META.get('HTTP_AUTHORIZATION'))
            res=post_data_to_core(savedFilePath, data, request.META.get('HTTP_AUTHORIZATION'))
            os.remove(savedFilePath)
        except OSError as err:
            pass
        return JsonResponse({'data': res})
    return JsonResponse({'result': 'Not implemented'})

            

       
        

