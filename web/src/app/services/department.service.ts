import { Injectable } from '@angular/core';
import { HttpHeaders,HttpClient } from '@angular/common/http';
import { ConstService } from './const.service';


@Injectable()
export class DepartmentService {

  header = new HttpHeaders();

  constructor(private http: HttpClient, private constService: ConstService) {}

  createDepartment(dept) {
    return this.http.post(this.constService.baseUrl + 'department/', dept);
  }

  searchDepartment(companyId) {
   return this.http.get(this.constService.baseUrl + 'department/?id=' + companyId);
  }

  deleteDepartment(id) {
    return this.http.delete(this.constService.baseUrl + 'department/?id=' + id);
  }

  editDepartment(dept) {
    return this.http.put(this.constService.baseUrl + 'department/', dept);

  }

}
