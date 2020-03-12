import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConstService } from './const.service';

@Injectable()
export class PipelineService {

  constructor(private http: HttpClient, private constService: ConstService) { }

  getApplicantsByJob(jobPostId, applicantName = '') {
    return this.http.get(this.constService.baseUrl + 'pipeline?jobId=' + jobPostId + '&search=' + applicantName);
  }

  updateApplicantStatus(applicant) {
    return this.http.put(this.constService.baseUrl + 'job/applicant', applicant);
  }

  getPipelineTabs(id) {
    return this.http.get(this.constService.baseUrl + 'pipeline/gettabs/' + id);
  }

  updatePipelinePosition(tab) {
    return this.http.put(this.constService.baseUrl + 'pipeline/position', tab);
  }

  updatePipelineDetails(tab) {
    return this.http.put(this.constService.baseUrl + 'pipeline/details', tab);
  }

  deletePipeline(tabId) {
    return this.http.delete(this.constService.baseUrl + 'pipeline/' + tabId);
  }
}
