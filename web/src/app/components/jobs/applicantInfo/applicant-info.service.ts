import { Injectable } from '@angular/core';
import { ConstService } from '../../../services/const.service';
import { HttpClient } from '../../../../../node_modules/@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class ApplicantInfoService {

  constService = new ConstService();

  constructor(private http: HttpClient) { }

  reject(comment) {
    return this.http.post(this.constService.baseUrl + 'applicant/reject', comment);
  }

  getRejections(id) {
    return this.http.get(this.constService.baseUrl + 'applicant/getrejection/' + id);
  }

  getHistory(applicantId, jobPostId) {
    return this.http.get(`${this.constService.baseUrl}applicant/history/${applicantId}`);
  }

  getRejectHistory(id, jobId) {
    return this.http.get(this.constService.baseUrl + 'job/rejectcomments/' + id + '/' + jobId);
  }

  getAppliedJob(applicantId): Observable<Object> {
    return this.http.get(this.constService.baseUrl + 'applicant/appliedjob/' + applicantId);
  }

  getAllJobHistory(applicantId) {
    return this.http.get(this.constService.baseUrl + 'job/alljobhistory/' + applicantId);
  }

  getEducationById(applicantId) {
    return this.http.get(this.constService.baseUrl + 'candidate/educationbyid/' + applicantId);
  }

  getExperienceById(applicantId) {
    return this.http.get(this.constService.baseUrl + 'candidate/experiencebyid/' + applicantId);
  }

  getApplicantById(applicantId) {
    return this.http.get(`${this.constService.baseUrl}applicant/${applicantId}`);
  }

  getJobsByApplicantId(applicantId) {
    return this.http.get(`${this.constService.baseUrl}applicant/job/${applicantId}`);
  }

  getJobAndComments(applicantId, jobId) {
    return this.http.get(`${this.constService.baseUrl}applicant/comment/${applicantId}/${jobId}`);
  }
}
