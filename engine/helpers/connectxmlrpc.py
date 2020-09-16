import json
import time
import helpers.eazyrecruitApi as EazyrecruitAPI
import xmlrpc.client

def odoodata():
    token = EazyrecruitAPI.login()
    #print(token)  
    common = xmlrpc.client.ServerProxy('{}/xmlrpc/2/common'.format(EazyrecruitAPI.val['url']))
    uid = common.authenticate(EazyrecruitAPI.val['db'],EazyrecruitAPI.val['username'],EazyrecruitAPI.val['password'], {})
    models = xmlrpc.client.ServerProxy('{}/xmlrpc/2/object'.format(EazyrecruitAPI.val['url']))
    jobPositions = models.execute_kw(EazyrecruitAPI.val['db'], uid, EazyrecruitAPI.val['password'],'hr.job', 'search_read',[[]])
    #print(jobPositions)
    for jobPosition in jobPositions:
        companyInfo = models.execute_kw(EazyrecruitAPI.val['db'], uid, EazyrecruitAPI.val['password'],
            'res.partner', 'search_read', [[["id", "=", jobPosition['company_id'][0]]]])
        #print(jobPosition)
        #print(companyInfo)
        #print('asdsfsdf')
        address = ''
        street = ''
        street2 = ''
        zip = ''
        city = ''
        state = ''
        country = ''
        phone = '1234567890'
        email = 'example@example.com'
        if companyInfo[0]["street"]:
            street = companyInfo[0]["street"]
        if companyInfo[0]["street2"]:
            street2 = ' ' + companyInfo[0]["street2"]
        if companyInfo[0]["zip"]:
            zip = ' ' + companyInfo[0]["zip"]
        if companyInfo[0]["city"]:
            city = ' ' + companyInfo[0]["city"]
        if companyInfo[0]["state_id"]:
            state = ' ' + companyInfo[0]["state_id"][1]
        if companyInfo[0]["country_id"]:
            country = ' ' + companyInfo[0]["country_id"][1]
        if companyInfo[0]["phone"]:
            phone = companyInfo[0]["phone"]
        if companyInfo[0]["email"]:
            email = companyInfo[0]["email"]
        companyData = {
            "companyName": companyInfo[0]["name"],
            "address": (street + street2 + zip + city + state + country),
            "email": email,
            "phoneNo": phone
        }
        #print(companyData)
        companyResponse = EazyrecruitAPI.postData(json.dumps(companyData), '/company', token)
        #print(companyResponse)
        if companyResponse!=0 :
            companyId = companyResponse['success']['data']['id']
        else:
            companyId = 0
            #print(companyId)
        if not jobPosition['department_id']:
            departmentName = 'Administration'
        else:
            departmentName = jobPosition['department_id'][1]
        #print(departmentName)
        departmentData = {
            "category": companyId,
            "departmentName": departmentName
        }
        #print(departmentData)
        departmentResponse = EazyrecruitAPI.postData(json.dumps(departmentData), '/department', token)
        #print(departmentResponse)
        if departmentResponse!=0 :
            departmentId = departmentResponse['success']['data']['id']
        else:
            departmentId = 0
        #print(departmentId)
        jobPostData ={
            "title": jobPosition['name'],
            "department": departmentId,
            "experiance": "",
            "ctc": "",
            "description": jobPosition['description'],
            "responsibilities": "",
            "location": [],
            "jobtype": ["Full-Time","Half-Time"],
            "skill": []
        }
        #print(jobPostData)
        jobPostResponse = EazyrecruitAPI.postData(json.dumps(jobPostData), '/job', token)
        #print(jobPostResponse)
        if jobPostResponse != 0:
            jobPostId = jobPostResponse['success']['data']['id']
        else:
            jobPostId = 0
        #print(jobPostId)
        #api creation
        pipeline={
        "jobPostId": jobPostId,
        "name": [
            'Calling Profiles','Awaiting Response','Shortlisting','ER Interview','On Hold','Rejected by ER','Company Interview',
            "Company's Client Interview",'Data Base','Selected','Refused to Join']
        }
        pipeResponse= EazyrecruitAPI.postData(json.dumps(pipeline),'/pipeline/create',token)
        #print(pipeResponse)
        #test.append(pipeResponse['success']['data']['name'])
        #print('testdata',test)


        for applicant in jobPosition['application_ids']:
            applicantsInfo = models.execute_kw(EazyrecruitAPI.val['db'], uid, EazyrecruitAPI.val['password'],'hr.applicant', 'search_read', [[["id", "=", applicant]]])
            #print('sfhsgjgs')
            #print(applicantsInfo)
            firstname= ''
            middlename= ''
            lastname= ''
            for applicantDetail in applicantsInfo:
                print('******************************************************',applicantDetail)
                applicantName = applicantDetail['partner_name']
                if type(applicantName) is bool:
                    applicantName='UNKNOWN'
                applicantName = applicantName.strip().split(' ')
                print('=============================',applicantName,'type',type(applicantName))
                if len(applicantName)>2:
                    firstname = applicantName[0]
                    middlename = applicantName[1]
                    lastname = applicantName[2]
                elif len(applicantName)==1:
                    firstname= applicantName[0]
                    lastname = ''
                else:
                    firstname= applicantName[0]
                    lastname= applicantName[1]
                pipename=applicantDetail['stage_id'][1]
                #print(pipename)
                '''applicantData = {
                    "firstName": firstname,
                    "middleName":middlename,
                    "lastName": lastname,
                    "email": applicantDetail['email_from'],
                    "phoneNo": applicantDetail['partner_mobile'],
                    #"document": applicantDetail['documents']
                }'''
                # print(applicantData)
                if(len(applicantDetail['attachment_ids'])>0):
                    for attachementIds in applicantDetail['attachment_ids']:
                        attachmentInfo = models.execute_kw(EazyrecruitAPI.val['db'], uid, EazyrecruitAPI.val['password'],
                            'ir.attachment', 'search_read', [[["id", "=", attachementIds]]])
                        """ print('***********attachmentInfo START &&&&&&&&++++++++=====')
                        print(attachmentInfo)
                        print('***********attachmentInfo END &&&&&&&&++++++++=====') """
                        if attachmentInfo[0]['datas'] is not False:
                            attachmentData = {
                                "fileName": attachmentInfo[0]['name'],
                                "fileType": attachmentInfo[0]['mimetype'],
                                "resume": attachmentInfo[0]['datas']
                            };
                            attachmentResponse = EazyrecruitAPI.postData(json.dumps(attachmentData), '/jobApply/resume', token)
                            #print(attachmentResponse)
                            if(attachmentResponse!=0):
                                if 'success' in attachmentResponse:
                                    attachmentId = attachmentResponse['success']['data']['_id']
                                else:
                                    attachmentId = ''
                            else:
                                attachmentId = ''

                            if(attachmentId!='' and applicantDetail['email_from']!=bool):
                                applicantData = {
                                    "firstName": firstname,
                                    "middleName":middlename,
                                    "lastName": lastname,
                                    "email": applicantDetail['email_from'],
                                    "phoneNo": applicantDetail['partner_mobile'],
                                    'resumeId':attachmentId
                                    #"document": applicantDetail['documents']
                                }
                                #print(applicantData)
                                applicantResponse = EazyrecruitAPI.postData(json.dumps(applicantData), '/candidate/save', token)
                                print("response=====",applicantResponse) 
                                if applicantResponse != 0:
                                    if 'success' in attachmentResponse:
                                        ids=[]
                                        ids.append(applicantResponse['success']['data']['_id'])
                                        #print(id)
                                        data=[]
                                        test= []
                                        data.append(applicantResponse['success']['data'])
                                        #print(data)
                                        #print("important",pipeResponse)
                                        i=0
                                        pipelineid=1
                                        for pipe in pipeResponse['success']['data']:
                                            #print(pipe['name'])
                                            #print(pipename)
                                            abcd=pipe['name']
                                            if abcd in pipename:
                                                #test.append(pipeResponse['success']['data'][i]['id'])
                                                pipelineid=pipeResponse['success']['data'][i]['id']
                                                '''print('length nikalo test ki',len(test))
                                                print('test ko print kro',test)
                                                print(i)'''
                                                #pipelineid=test[i]
                                                #print('andar wala',pipelineid)
                                            i=i+1
                                            #print('bahar wala',pipename)
                                        #print(test)                                                
                                        #mysql id applicant
                                        objdata = {
                                            "ids":ids,
                                            "data":data,
                                            "jobPostId":jobPostId,
                                            "pipelineId":pipelineid
                                        }
                                        #print(objdata)
                                        idsql=EazyrecruitAPI.postData(json.dumps(objdata),'/profile/save',token)
                                        #print(idsql) 
        
            """else:
                if(attachmentId==''):
                    applicantData = {
                        "firstName": firstname,
                        "middleName":middlename,
                        "lastName": lastname,
                        "email": applicantDetail['email_from'],
                        "phoneNo": applicantDetail['partner_mobile'],
                        'resumeId':''
                        #"document": applicantDetail['documents']
                    }
                    #print(applicantData)
                    applicantResponse = EazyrecruitAPI.postData(json.dumps(applicantData), '/candidate/save', token)
                    #print(applicantResponse) 
                    if applicantResponse != 0:
                        if 'success' in attachmentResponse:
                            ids=[]
                            ids.append(applicantResponse['success']['data']['_id'])
                            #print(id)
                            data=[]
                            test= []
                            data.append(applicantResponse['success']['data'])
                            #print(data)
                            #print("important",pipeResponse)
                            i=0
                            pipelineid=1
                            for pipe in pipeResponse['success']['data']:
                                #print(pipe['name'])
                                #print(pipename)
                                abcd=pipe['name']
                                if abcd in pipename:
                                    #test.append(pipeResponse['success']['data'][i]['id'])
                                    pipelineid=pipeResponse['success']['data'][i]['id']
                                    '''print('length nikalo test ki',len(test))
                                    print('test ko print kro',test)
                                    print(i)'''
                                    #pipelineid=test[i]
                                    #print('andar wala',pipelineid)
                                i=i+1
                                #print('bahar wala',pipename)
                            #print(test)                                                
                            #mysql id applicant
                            objdata = {
                                "ids":ids,
                                "data":data,
                                "jobPostId":jobPostId,
                                "pipelineId":pipelineid
                            }
                            #print(objdata)
                            idsql=EazyrecruitAPI.postData(json.dumps(objdata),'/profile/save',token)
                                """          
                            #print(idsql)
                                                    # applicantId = applicantResponse['success']['data']['id']
                                # else:
                                #     applicantId = 0
                                # if applicantId>0 :
                                #     if not applicantDetail['stage_id']:
                                #         stage_id = 0
                                #     else:
                                #         stage_id = applicantDetail['stage_id'][0]
                                #     if stage_id==5:
                                #         stage_id = 0;
                                #     applicantJobPostData = {
                                #         "jobPostId": jobPostId,
                                #         "applicantId": applicantId,
                                #         "status": stage_id
                                #     }                                    
                #                     applicantJobPostResponse = EazyrecruitAPI.postData(json.dumps(applicantJobPostData), '/jobApply/applicantJobPostMap', token)
                #                     print(applicantJobPostResponse)
                #                 applicantAttachmentData = {
                #                     "resumeId": attachmentId,
                #                     "applicantId": applicantId
                #                 };
                #                 applicantAttachmentResponse = EazyrecruitAPI.postData(json.dumps(applicantAttachmentData),
                #                                                       '/jobApply/attachResume', token)
                #                 if (applicantAttachmentResponse != 0):
                #                     applicantAttachmentId = applicantAttachmentResponse['success']['data']['id']
                #                 else:
                #                     applicantAttachmentId = 0
                #                 applicantResponse = EazyrecruitAPI.postData(json.dumps(applicantData), '/candidate/save', token)
                #                 print(applicantResponse)
                #                 if (applicantResponse != 0):
                #                     applicantId = applicantResponse['success']['data']['id']
                #                 else:
                #                     applicantId = 0
                #                 if applicantId>0 :
                #                     if not applicantDetail['stage_id']:
                #                         stage_id = 0
                #                     else:
                #                         stage_id = applicantDetail['stage_id'][0]
                # if stage_id==5:
                #     stage_id = 0;                
                # applicantJobPostData = {
                #     "jobPostId": jobPostId,
                #     "applicantId": applicantId,
                #     "status": stage_id
                # }
                # applicantJobPostResponse = EazyrecruitAPI.postData(json.dumps(applicantJobPostData), '/jobApply/applicantJobPostMap', token)
                # print(applicantJobPostResponse)
                # if (applicantJobPostResponse != 0):
                #     if(len(applicantDetail['attachment_ids'])>0):
                #         for attachementIds in applicantDetail['attachment_ids']:
                #             attachmentInfo = models.execute_kw(connection.db, uid, connection.password,
                #                                                'ir.attachment', 'search_read', [[["id", "=", attachementIds]]])
                #             print(attachmentInfo)
                #             attachmentData = {
                #                 "fileName": attachmentInfo[0]['name'],
                #                 "fileType": attachmentInfo[0]['mimetype'],
                #                 "resume": attachmentInfo[0]['datas']
                #             };
                #             attachmentResponse = EazyrecruitAPI.postData(json.dumps(attachmentData), '/jobApply/uploadResumeBase64', token)
                #             print(attachmentResponse)
                #             if(attachmentResponse!=0):
                #                 if 'success' in attachmentResponse:
                #                     attachmentId = attachmentResponse['success']['data']['_id']
                #                 else:
                #                     attachmentId = ''
                #             else:
                #                 attachmentId = ''
                #             if(attachmentId!=''):
                #                 applicantAttachmentData = {
                #                     "resumeId": attachmentId,
                #                     "applicantId": applicantId
                #                 };
                #                 applicantAttachmentResponse = EazyrecruitAPI.postData(json.dumps(applicantAttachmentData),
                #                                                       '/jobApply/attachResume', token)
                #                 if (applicantAttachmentResponse != 0):
                #                     applicantAttachmentId = applicantAttachmentResponse['success']['data']['id']
                #                 else:
                #                     applicantAttachmentId = 0'''

#odoodata()