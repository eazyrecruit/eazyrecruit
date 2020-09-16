import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConstService } from './const.service';

@Injectable()
export class JobService {

  constructor(private http: HttpClient, private constService: ConstService) { }

  // (title = '') - this is to assign a default value to the title variable
  getJob(filter, active= true) {
    return this.http.get(`${this.constService.baseUrl}job?searchText=${filter.searchText}&offset=${filter.offset}&limit=${filter.pageSize}&active=${active}`);
  }
  archiveActiveJob(jouId, active) {
    return this.http.put(`${this.constService.baseUrl}job/archive/${jouId}`, {status: active});
  }

  getJobById(id) {
    return this.http.get(this.constService.baseUrl + 'job/' + id);
  }

  getWithApplicantsAndPipelineById(id) {
    return this.http.get(this.constService.baseUrl + 'job/applicants/pipelines/' + id);
  }

  searchWithApplicantsAndPipelineById(jobId, applicant = '') {
    return this.http.get(this.constService.baseUrl + 'job/applicants/search?jobId=' + jobId + '&search=' + applicant);
  }

  saveJob(Job) {
    const headers = new HttpHeaders();
    headers.set('Content-Type', 'multipart/form-data');
    return this.http.post(this.constService.baseUrl + 'job/', Job, { headers });
  }

  editJob(job) {
    return this.http.put(this.constService.baseUrl + 'job/', job);
  }

  deleteJob(id) {
    return this.http.delete(this.constService.baseUrl + 'job/' + id);
  }

  // get jobs skills
  getJobSkillsById(id) {
    return this.http.get(this.constService.baseUrl + 'job/jobskills/' + id);
  }

  searchJob(title) {
    return this.http.get(this.constService.baseUrl + 'job?title=' + title);
  }


  addPipeline(pipeline, jobId) {
    return this.http.post(this.constService.baseUrl + 'job/pipeline', { jobId: jobId, pipeline: pipeline });
  }

  addJobApplicant(jobApplicant) {
    return this.http.post(this.constService.baseUrl + 'job/applicant', jobApplicant);
  }
}
