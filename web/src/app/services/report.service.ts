import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConstService } from './const.service';

@Injectable()
export class ReportService {

  constructor(private http: HttpClient, private constService: ConstService) { }

  getForLast15Days() {
    return this.http.get(this.constService.baseUrl + 'reports/source/day/last15');
  }
}
