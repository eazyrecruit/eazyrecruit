import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConstService } from './const.service';

@Injectable()
export class ApplyJobService {

  constructor(private http: HttpClient, private constService: ConstService) { }

  getJobById(id) {
    return this.http.get(this.constService.baseUrl + 'jobapply/?guid=' + id);
  }

  saveJobByApplicant(appByJob) {
    return this.http.post(this.constService.baseUrl + 'jobapply/jobbyapplicant', appByJob);
  }
}

