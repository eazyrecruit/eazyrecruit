import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { ConstService } from './const.service';

@Injectable()
export class UploadService {

  header = new HttpHeaders();

  constructor(private http: HttpClient, private constService: ConstService) {}

  upload(resume)  {
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'multipart/form-data');
    return this.http.post(this.constService.pyUrl + 'resume', resume, { headers: headers });
    //return this.http.post("/engine/resume", resume, { headers: headers });
  }
  
  uploadResume(resume){
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'multipart/form-data');
    return this.http.post(this.constService.baseUrl + 'jobapply/resume', resume, { headers: headers });
  }
  updateResumeReference(resume_id,applicant_id){
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'multipart/form-data');
    return this.http.post(this.constService.baseUrl + 'jobapply/addResumeReference', {resume_id : resume_id,applicant_id :applicant_id}, { headers: headers });
  }

  getData(filterData)  {
    return this.http.post(this.constService.baseUrl + 'applicant/getdatails', filterData);
  }

  registerApplicant(resume)  {
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'multipart/form-data');
    let url = this.constService.baseUrl + 'jobapply/resume';
    return this.http.post(url, resume, { headers: headers });
  }

  saveApplicant(data) {
    return this.http.post(this.constService.baseUrl + 'jobapply/applicant', data);
  }

  saveApplicantInMongo(data) {
    return this.http.post(this.constService.baseUrl + 'candidate/save', data);
  }

  getavailability() {
    return this.http.get(this.constService.baseUrl + 'available/');
  }

  getParsedData(id) {
    return this.http.get(this.constService.pyUrl + 'extract/' + id + '/');
  }

  updateApplicant(data) {
    return this.http.put(this.constService.baseUrl + 'candidate/' + data.id, data);
  }

  updateResume(resume, id)  {
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'multipart/form-data');
    const url = this.constService.baseUrl + 'jobapply/resume?id=' + id;
    return this.http.put(url, resume, { headers: headers });
  }

}
