import {Injectable} from '@angular/core';

@Injectable()
export class SharedService {

    constructor() {
    }

    getAuthToken() {
        const authData = JSON.parse(localStorage.getItem('auth_data'));
        return authData.data.token;
    }

    getCompanyDetail() {
        return (localStorage.getItem('companyObj'));
    }

    setCompanyDetail(companyObj) {
        localStorage.setItem('companyObj', companyObj);
    }

    deleteCompanyDetail() {
        localStorage.removeItem('companyObj');
    }

    getDeptDetail() {
        return (localStorage.getItem('deptObj'));
    }

    setDeptDetail(deptObj) {
        localStorage.setItem('deptObj', deptObj);
    }

    deleteDeptDetail() {
        localStorage.removeItem('deptObj');
    }

    logout() {
        localStorage.clear();
    }

    getJobDetail() {
        return localStorage.getItem('jobDetail');
    }

    setJobDetail(jobDetail) {
        localStorage.setItem('jobDetail', jobDetail);
    }

    deleteJobDetail() {
        localStorage.removeItem('jobDetail');
    }

    getApplicantDetail() {
        return localStorage.getItem('applicant');
    }

    setApplicantDetail(applicant) {
        localStorage.setItem('applicant', applicant);
    }

    deleteApplicantDetail() {
        localStorage.removeItem('applicant');
    }

    getPipeLineColor() {
        return {
            'selected': 'bg-green-light',
            'rejected': 'bg-red-light',
            'pending': 'bg-yellow-light'
        };
    }

    getSourceColor() {
        return {
            'email': 'bg-green-light',
            'upload': 'bg-red-light',
            'website': 'bg-yellow-light',
            'db': 'bg-orange-light'
        };
    }

    getStatusColor() {
        return {
            'COMPLETED': 'bg-green-light',
            'ACTIVE': 'bg-yellow-light'
        };
    }

    getLoggedInUsername() {
        const username = JSON.parse(localStorage.getItem('auth_data'));
        return username['data'].displayName;
    }

}
