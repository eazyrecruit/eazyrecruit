import { Injectable } from '@angular/core';
import { HttpClient } from '../../../node_modules/@angular/common/http';
import { ConstService } from './const.service';

@Injectable()
export class LocationService {
  constService = new ConstService();

  constructor(private http: HttpClient) { }

  saveState(state) {
    return this.http.post(this.constService.baseUrl + 'location/states', state);
  }

  getState() {
    return this.http.get(this.constService.baseUrl + 'location/states');
  }

  getCities(stateId) {
    return this.http.get(this.constService.baseUrl + 'location/cities/' + stateId);
  }

  saveCity(city) {
    return this.http.post(this.constService.baseUrl + 'location/cities', city);
  }

  getAllCities(filter) {
    return this.http.post(this.constService.baseUrl + 'location/allcities', filter);
  }

  getLocations(filter){
    return this.http.get(`${this.constService.baseUrl}location/search/${filter}`);
  }
}
