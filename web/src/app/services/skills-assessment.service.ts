import { Injectable } from '@angular/core';
import { ConstService } from './const.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class SkillsAssessmentService {

  constructor(private http: HttpClient, private constService: ConstService) { }

  getSkills(applicantId) {
    return this.http.get(this.constService.baseUrl + 'jobapply/applicantSkill/' + applicantId);
  }

  getJobSkills(jobId) {
    return this.http.get(this.constService.baseUrl + 'jobapply/jobpostskills/?id=' + jobId);
  }

  saveSelfAssessment(assessmentData) {
    return this.http.post(this.constService.baseUrl + 'jobapply/selfassessment', assessmentData);
  }

  getAllSkills(filter) {
    return this.http.post(this.constService.baseUrl + 'skills/getskills', filter);
  }

}
