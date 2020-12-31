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
        return this.http.get(`${this.constService.baseUrl}applicant/activity/${id}`);
    }
}
