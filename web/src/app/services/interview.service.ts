import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConstService } from './const.service';

@Injectable()
export class InterviewService {

  constructor(private http: HttpClient, private constService: ConstService) { }

  getInterviewer(jobPostId) {
    return this.http.get(this.constService.baseUrl + 'user/search/' + jobPostId);
  }

  assignInterviewerToApplicant(interviewer) {
    return this.http.post(this.constService.baseUrl + 'interviewschedule/', interviewer);
  }

  assignInterviewerTojob(interviewer) {
    return this.http.post(this.constService.baseUrl + 'interviewer/', interviewer);
  }

  getInterviewerByJobId(jobPostId) {
    return this.http.get(this.constService.baseUrl + 'interviewer/' + jobPostId);
  }

  schedule(interview, id) {
    return this.http.post(this.constService.baseUrl + 'interview', {interview: interview, id: id});
  }

  reschedule(interview, id, sequence) {
    return this.http.put(this.constService.baseUrl + 'interview', {interview: interview, id: id, sequence: sequence});
  }

  getEventBetweenDates(start, end) {
    return this.http.get(`${this.constService.baseUrl}interview/dates/${start}/${end}`);
  }

  getInterviewsByCandidate(candidateId) {
    return this.http.get(this.constService.baseUrl + 'interview/candidate/' + candidateId);
  }

  getInterview(interviewId) {
    return this.http.get(this.constService.baseUrl + 'interview/' + interviewId);
  }
  
  getResults(interviewId) {
    return this.http.get(this.constService.baseUrl + 'interview/result/' + interviewId);
  }

  saveResult(results){
    return this.http.post(this.constService.baseUrl + 'interview/result', results);
  }

  deleteResult(id){
    return this.http.put(this.constService.baseUrl + 'interview/result', {id});
  }

  comment(interview){
    return this.http.put(this.constService.baseUrl + 'interview/comment', interview);
  }

  addCriteria(criteria) {
    return this.http.post(`${this.constService.baseUrl}interview/criteria`, criteria);
  }
}
