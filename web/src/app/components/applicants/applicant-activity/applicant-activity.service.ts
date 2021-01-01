import {Injectable} from '@angular/core';
import {ConstService} from '../../../services/const.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable()
export class ApplicantActivityService {

    constService = new ConstService();

    constructor(private http: HttpClient) {
    }

    getActivity(id) {
        return this.http.get(`${this.constService.baseUrl}activity/${id}`);
    }

    createActivity(body) {
        return this.http.post(`${this.constService.baseUrl}activity`, body);
    }
}
