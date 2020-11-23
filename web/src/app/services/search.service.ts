import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {ConstService} from './const.service';
import {SharedService} from './shared.service';
import {map} from 'rxjs/operators';

@Injectable()
export class SearchService {

    header = new HttpHeaders();

    constructor(private http: HttpClient, private constService: ConstService, private sharedService: SharedService) {
    }

    search(details) {
        return this.http.post(this.constService.baseUrl + 'applicant/search', details);
    }

    getAllResume(filter) {
        return this.http.post(this.constService.baseUrl + 'applicant/', filter);
    }

    getData(filter) {
        if (filter.searchJob) {
            return this.http.post(`${this.constService.baseUrl}applicant/search-by-job`, filter);
        }
        return this.http.get(`${this.constService.baseUrl}applicant/search?limit=${filter.pageSize}&offset=${filter.offset}&search=${filter.searchText}`);
    }

    getApplicantData(filter) {
        let url = `${this.constService.baseUrl}applicant/search?offset=${filter.offset}&limit=${filter.pageSize}`;
        if (filter.searchText) {
            url = `${url}&search=${filter.searchText}`;
        }
        if (filter.source) {
            url = `${url}&source=${filter.source}`;
        }
        if (filter.startDate && filter.endDate) {
            url = `${url}&startDate=${filter.startDate}&endDate=${filter.endDate}`;
        }
        if (filter.sortBy && filter.order) {
            url = `${url}&sortBy=${filter.sortBy}&order=${filter.order}`;
        }
        return this.http.get(url);
    }

    getHeaders() {
        const token = this.sharedService.getAuthToken();
        const headerDict = {'Authorization': 'Bearer ' + token, 'Accept': 'application/pdf'};
        const headerObj = {headers: new HttpHeaders(headerDict)};
        return headerObj;
    }

    downloadPdf(id) {
        const headers: HttpHeaders = this.getHeaders().headers;
        return this.http.get(this.constService.baseUrl + 'applicant/download/' + id, {
            headers: headers,
            responseType: 'blob'
        }).pipe(
            map((res) => {
                return new Blob([res], {type: res.type});
            })
        );
    }

    getSearchResult(search) {
        return this.http.post(this.constService.baseUrl + 'applicant/', search);
    }

    saveSearchResult(data) {
        return this.http.post(this.constService.baseUrl + 'profile/save', data);
    }

    // search from mongo
    getApplicant(search) {
        return this.http.post(this.constService.baseUrl + 'candidate/getProfile', search);
    }

    getResumeFile(resume_id) {
        return this.http.get(this.constService.baseUrl + 'resume/file/' + resume_id, {responseType: 'arraybuffer'});
    }
}
