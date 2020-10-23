import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConstService } from './const.service';
import { SharedService } from './shared.service';
import { map } from 'rxjs/operators';

@Injectable()
export class SearchService {

  header = new HttpHeaders();
  constructor(private http: HttpClient, private constService: ConstService, private sharedService: SharedService) { }

  search(details) {
    return this.http.post(this.constService.baseUrl + 'applicant/search', details);
  }

  getAllResume(filter) {
    return this.http.post(this.constService.baseUrl + 'applicant/', filter);
  }
  getData(filter) {
    if (filter.searchJob) {
      return this.http.get(`${this.constService.baseUrl}applicant/search?limit=${filter.pageSize}&offset=${filter.offset}&searchJob=${filter.searchJob}`);
    }
    return this.http.get(`${this.constService.baseUrl}applicant/search?limit=${filter.pageSize}&offset=${filter.offset}&search=${filter.searchText}`);
  }
  getHeaders() {
    const token = this.sharedService.getAuthToken();
    const headerDict = { 'Authorization': 'Bearer ' + token, 'Accept': 'application/pdf' };
    const headerObj = { headers: new HttpHeaders(headerDict) };
    return headerObj;
  }

  downloadPdf(id) {
    const headers: HttpHeaders = this.getHeaders().headers;
    return this.http.get(this.constService.baseUrl + 'applicant/download/' + id, { headers: headers, responseType: 'blob' }).pipe(
      map((res) => {
        return new Blob([res], { type: res.type });
      })
    );
  }

  getSearchResult(search) {
    return this.http.post(this.constService.baseUrl + 'applicant/', search);
  }

  saveSearchResult(data) {
    return this.http.post(this.constService.baseUrl + 'profile/save', data);
  }

  // search from mongo
  getApplicant(search) {
    return this.http.post(this.constService.baseUrl + 'candidate/getProfile', search);
  }

  getResumeFile(resume_id) {
    return this.http.get(this.constService.baseUrl + 'resume/file/' + resume_id, { responseType: 'arraybuffer' });
  }
}
