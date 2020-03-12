import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConstService } from './const.service';

@Injectable()
export class SettingService {

  constructor(private http: HttpClient, private constService: ConstService) { }

  getSettings(group) {
    return this.http.get(this.constService.baseUrl + 'company/settings', group);
  }

  deleteSetting(id){
    return this.http.delete(this.constService.baseUrl + 'company/settings/?id=' + id);
  }
}
