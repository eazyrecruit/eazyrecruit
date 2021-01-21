import {Injectable} from '@angular/core';
import {ConstService} from '../../../services/const.service';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class ApplicantTaskService {

    constService = new ConstService();

    constructor(private http: HttpClient) {
    }

    createTask(body) {
        return this.http.post(`${this.constService.baseUrl}task`, body);
    }

    getTask(applicantId) {
        return this.http.get(`${this.constService.baseUrl}task/${applicantId}`);
    }

    deleteTask(id) {
        return this.http.delete(`${this.constService.baseUrl}task/${id}`);
    }

    updateTask(id, body) {
        return this.http.put(`${this.constService.baseUrl}task/${id}`, body);
    }

    getAllUsers() {
        return this.http.get(`${this.constService.baseUrl}user?all=true`);
    }
}
