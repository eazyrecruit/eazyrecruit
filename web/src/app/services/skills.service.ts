import { Injectable } from '@angular/core';
import { ConstService } from './const.service';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class SkillsService {

  constructor(
    private http: HttpClient,
    private constService: ConstService
  ) { }

  // getSkills(text: any) {
  //   return this.http.get(this.constService.baseUrl + 'skills/' + text);
  // }

  getSkills(filter) {
    return this.http.get(`${this.constService.baseUrl}skills?limit=${filter.pageSize}&offset=${filter.offset}&search=${filter.searchText}`);
  }

  getSkill(filter) {
    return this.http.get(`${this.constService.baseUrl}skill?limit=${filter.limit}&offset=${filter.offset}`);
  }

  saveSkills(skills) {
    return this.http.post(this.constService.baseUrl + 'skill/', skills);
  }

  editSkill(skill, id) {
    // return this.http.put(this.constService.baseUrl + 'skills/', {id: id, name: 'new technology'});
    return this.http.put(this.constService.baseUrl + 'skill/' + id, skill);
  }

  deleteSkill(id) {
    return this.http.delete(this.constService.baseUrl + 'skill/' + id);
  }
}
