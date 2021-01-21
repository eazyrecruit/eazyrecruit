import {Component, OnInit, Input, OnChanges} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ApplicantInfoService} from '../../../common/applicantInfo/applicant-info.service';

declare global {
    interface Window {
        editApplicantPopup: any;
    }
}

@Component({
    selector: 'app-referred-applicant-info',
    templateUrl: './referred.applicant.info.component.html',
    providers: [ApplicantInfoService]
})
export class ReferredApplicantInfoComponent implements OnInit, OnChanges {
    gettingApplicant = false;
    jobLoad = false;
    jobId: any;
    jobsSkils = {};
    SkillDiv = '';
    @Input()
    applicant?: any;
    applicantData?: any;
    applyJobs: any = [];

    constructor(
        private route: ActivatedRoute,
        private applicantInfoService: ApplicantInfoService
    ) {
    }

    ngOnInit() {
        this.jobId = this.route.params['value'].jobId;
        this.applicant = null;
        this.applicantData = null;
    }

    ngOnChanges() {
        if (this.applicant) {
            this.SkillDiv = '';
            this.gettingApplicant = true;
            document.getElementById('history').click();
            this.getApplicantById(this.applicant._id);
            this.getJobsByApplicantId();
        }
    }

    getFullName(firstName, middleName, lastName) {
        let name = firstName;
        if (middleName && middleName != 'null') name = name + ' ' + middleName;
        if (lastName && lastName != 'null') name = name + ' ' + lastName;
        return name;
    }

    getApplicantById(id: string) {
        this.applicantInfoService.getApplicantById(id).subscribe(result => {
            if (result) {
                this.applicant = result['success']['data'];
                this.applicantData = result['success']['data'];
                this.applicant.fullName = this.getFullName.bind(this.applicant);
                this.applicantData.fullName = this.getFullName.bind(this.applicantData);
            }
            this.gettingApplicant = false;
        }, () => {
            this.gettingApplicant = false;
        });
    }

    getJobsByApplicantId() {
        if (this.applicant._id) {
            this.applicantInfoService.getJobsByApplicantId(this.applicant._id).subscribe(result => {
                if (result && result['success'] && result['success']['data'] && result['success']['data'].length) {
                    this.applicant.jobs = result['success']['data'];
                    this.setJobsSkils(result['success']['data']);
                } else {
                    this.jobLoad = true;
                }
            }, () => {
                this.jobLoad = true;
            });
        }
    }

    setJobsSkils(jobsApplicants) {
        this.jobsSkils = {};
        for (let index = 0; index < jobsApplicants.length; index++) {
            const job = jobsApplicants[index].job || {};
            job['pipeline'] = jobsApplicants[index].pipeline;
            this.applyJobs.push(job);
        }
        this.jobLoad = true;

    }
}
