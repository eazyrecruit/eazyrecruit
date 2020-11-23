import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {ConstService} from './const.service';

@Injectable()
export class JobService {

    constructor(private http: HttpClient, private constService: ConstService) {
    }

    // (title = '') - this is to assign a default value to the title variable
    getJob(filter, active = true) {
        return this.http.get(`${this.constService.baseUrl}job?searchText=${filter.searchText}&offset=${filter.offset}&limit=${filter.pageSize}&active=${active}`);
    }

    archiveActiveJob(jouId, active) {
        return this.http.put(`${this.constService.baseUrl}job/archive/${jouId}`, {status: active});
    }

    getJobById(id) {
        return this.http.get(this.constService.baseUrl + 'job/' + id);
    }

    getJobsName(jobId = null) {
        let url = `${this.constService.baseUrl}job/jobname`;
        if (jobId) {
            url = `${url}?jobId=${jobId}`;
        }
        return this.http.get(url);
    }

    getWithApplicantsAndPipelineById(id) {
        return this.http.get(this.constService.baseUrl + 'job/applicants/pipelines/' + id);
    }

    getJobApplicant(filter) {

        if (filter.isGridView) {
            filter.pageSize = 1000;
        }
        let url = `${this.constService.baseUrl}job/applicants?offset=${filter.offset}&limit=${filter.pageSize}`;
        if (filter.jobId) {
            url = `${url}&jobId=${filter.jobId}`;
        }
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

    getJobPipeLine(id) {
        return this.http.get(this.constService.baseUrl + 'job/pipelines/' + id);
    }

    searchWithApplicantsAndPipelineById(jobId, offset, limit, applicant = '') {
        return this.http.get(this.constService.baseUrl + 'job/applicants/search?jobId=' + jobId + '&search=' + applicant + '&offset=' + offset + '&limit=' + limit);
    }

    saveJob(Job) {
        const headers = new HttpHeaders();
        headers.set('Content-Type', 'multipart/form-data');
        return this.http.post(this.constService.baseUrl + 'job/', Job, {headers});
    }

    editJob(job) {
        return this.http.put(this.constService.baseUrl + 'job/', job);
    }

    deleteJob(id) {
        return this.http.delete(this.constService.baseUrl + 'job/' + id);
    }

    // get jobs skills
    getJobSkillsById(id) {
        return this.http.get(this.constService.baseUrl + 'job/jobskills/' + id);
    }

    searchJob(title) {
        return this.http.get(this.constService.baseUrl + 'job?title=' + title);
    }


    addPipeline(pipeline, jobId) {
        return this.http.post(this.constService.baseUrl + 'job/pipeline', {jobId: jobId, pipeline: pipeline});
    }

    addJobApplicant(jobApplicant) {
        return this.http.post(this.constService.baseUrl + 'job/applicant', jobApplicant);
    }
}
