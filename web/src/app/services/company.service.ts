import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConstService } from './const.service';

@Injectable()
export class CompanyService {

  constructor(private http: HttpClient, private constService: ConstService) { }

  createCompany(company) {

    return this.http.post(this.constService.baseUrl + 'company/', company);
  }

  searchCompany() {
    return this.http.get(this.constService.baseUrl + 'company/');
  }

  getCompany() {
    return this.http.get(this.constService.baseUrl + 'company/');
  }

  getSettings(id, group) {
    return this.http.get(this.constService.baseUrl + 'company/settings/?id=' + id + '&group=' + group);
  }

  editSettings(form, id, group) {
    return this.http.put(this.constService.baseUrl + 'company/settings/?id=' + id + '&group=' + group, form);
  }

  deleteCompany(id) {
    return this.http.delete(this.constService.baseUrl + 'company/?id=' + id);
  }

  editCompany(company) {
    return this.http.put(this.constService.baseUrl + 'company', company);
  }
}
