import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConstService } from './const.service';
import { Observable } from 'rxjs';

@Injectable()
export class ApplicantDataService {

  applicant: any;

  constructor(private http: HttpClient, private constService: ConstService) { }

  setApplicantId(id) {
    localStorage.setItem('applicantId', JSON.stringify(id));
  }

  getApplicantId() {
    return JSON.parse(localStorage.getItem('applicantId'));
  }

  getApplicantData(id) {
    return this.http.get(`${this.constService.baseUrl}candidate/${id}`);
  }

  getApplicantCompleteData(id){
    return this.http.get(`${this.constService.baseUrl}applicant/${id}`);
  }

  getByMongo(id){
    return this.http.get(`${this.constService.baseUrl}applicant/id/${id}`);
  }

  getResumeFile(resume_id) {
    return this.http.get(`${this.constService.baseUrl}resume/file/${resume_id}`, {responseType: 'arraybuffer'});
  }

    getResumeDocFile(resume_id: string): Observable<any> {
        return this.http.get(`${this.constService.baseUrl}resume/file/${resume_id}`);
    }
}
