import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { ConstService } from '../../../services/const.service';

@Injectable()
export class ApplicantsearchService {

  header = new HttpHeaders();
  constructor(private http: HttpClient, private constService: ConstService) { }

  getSearchResult(search) {
    return this.http.post(this.constService.baseUrl + 'profile/', search);
  }

  saveSearchResult(data) {
    return this.http.post(this.constService.baseUrl + 'profile/save', data);
  }

  getApplicantInfo(id) {
    return this.http.get(this.constService.baseUrl + 'profile/' + id);
  }

  getProfileByEmail(email) {
    return this.http.get(this.constService.baseUrl + 'profile/email/' + email);
}

}
