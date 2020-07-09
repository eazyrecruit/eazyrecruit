import { Injectable } from '@angular/core';
import { ConstService } from './const.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { idLocale } from 'ngx-bootstrap';
import { AccountService } from './account.service';

@Injectable()
export class ApplicantService {
constService = new ConstService();

constructor(private http: HttpClient, private accountService: AccountService) { }

    // uploadApplicantData(data) {
    //     return this.http.post(this.constService.baseUrl + '/applicant/upload-data', data);
    // }

    // getApplicant(data) {
    //     return this.http.post(this.constService.baseUrl + '/applicant/get-applicant', data);
    // }

    // getApplicantById(id) {
    //     return this.http.get(this.constService.baseUrl + `/applicant/get-applicant/${id}`);
    // }

    save(data) {
        const headers = new HttpHeaders();
        headers.set('Content-Type', 'multipart/form-data');
        return this.http.post(this.constService.baseUrl + 'applicant/', data, { headers: headers });
    }

    resume(data) {
        const headers = new HttpHeaders();
        headers.set('Content-Type', 'multipart/form-data');
        return this.http.post(this.constService.baseUrl + 'applicant/resume/', data, { headers: headers });
    }
    // save (resume)  {
    //     const headers = new HttpHeaders();
    //     headers.set('Content-Type', 'multipart/form-data');
    //     headers.set('Authorization', `Bearer ${this.accountService.getToken()}`);
    //     return this.http.post(this.constService.pyUrl + 'resume', resume, { headers: headers });
    //     //return this.http.post("/engine/resume", resume, { headers: headers });
    // }

    reprocess(){
        return this.http.get(this.constService.baseUrl + 'applicant/reparse/');
    }

    resync(){
        return this.http.get(this.constService.baseUrl + 'applicant/resync/');
    }

    getComments(id) {
        return this.http.get(this.constService.baseUrl + 'applicant/comment/' + id)
    }

    addComment(comment) {
        return this.http.post(this.constService.baseUrl + 'applicant/comment' , comment)
    }

    editComment(comment) {
        return this.http.put(this.constService.baseUrl + 'applicant/comment' , comment)
    }
    
    removeApplicantFromJob(id: string) {
        return this.http.delete(`${this.constService.baseUrl}job/applicant/${id}`).subscribe();
    }
}
