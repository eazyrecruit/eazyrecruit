import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';

@Injectable()
export class StateService {

  constructor(private http: HttpClient) {
    this.getJSON().subscribe(data => {
    });
  }

  public getJSON(): Observable<any> {
    return this.http.get('../../assets/json/state.json');
  }

}
