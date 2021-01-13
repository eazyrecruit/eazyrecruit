import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {Router, Params, ActivatedRoute} from '@angular/router';
import {SearchService} from '../../services/search.service';
import {JobService} from '../../services/job.service';
import {ApplyJobService} from '../../services/apply-job.service';
import {ApplicantService} from '../../services/applicant.service';
import {ApplicantDataService} from '../../services/applicant-data.service';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';
import {CreateApplicantComponent} from '../applicants/create-applicant/create-applicant.component';
import {UploadResumeComponent} from '../applicants/upload-resume/upload-resume.component';
import {SharedService} from '../../services/shared.service';
import {CreateReferredApplicantComponent} from "./create-referred-applicant/create.referred.applicant.component";

declare var SiteJS: any;

@Component({
    templateUrl: 'referred.applicant.component.html',
    providers: [SearchService, JobService, ApplyJobService, ApplicantService, ApplicantDataService, BsModalService]
})
export class ReferredApplicantComponent implements OnInit {

    filter = {
        pageIndex: 1, pageSize: 10, offset: 0, sortBy: 'modified_at',
        order: -1, searchText: '',
    };
    totalRecords = 1;
    gettingApplicant = false;
    searchText = '';
    job: any;
    file: File;
    candidates = [];
    ApplicantList = [];
    applicant: any;
    modalRef: BsModalRef;

    jobId: any;
    pipeId: any;
    sourceColor: any = this.sharedService.getSourceColor();

    constructor(private searchService: SearchService,
                private fb: FormBuilder,
                private jobService: JobService,
                private applyJobService: ApplyJobService,
                private router: Router,
                private activateRoute: ActivatedRoute,
                private applicantService: ApplicantService,
                private sharedService: SharedService,
                private applicantDataService: ApplicantDataService,
                private modalService: BsModalService) {

        this.activateRoute.params.subscribe((params) => {
            this.jobId = params.jobId ? params.jobId : null;
            this.pipeId = params.pipelineId ? params.pipelineId : null;
            if (this.jobId) {
                this.getJobsName(this.jobId);
            }
        });
    }

    getSourceColor(source) {
        return this.sourceColor[source] || '';
    }

    onSort(event) {
        this.filter.offset = 0;
        this.filter.sortBy = event;
        this.filter.order *= -1;
        this.ApplicantList = [];
        this.totalRecords = 0;
        this.getCandidate();
    }

    onSearch() {
        if (this.searchText !== this.filter.searchText) {
            this.filter.offset = 0;
            if (this.searchText.length > 2) {
                this.ApplicantList = [];
                this.totalRecords = 0;
                this.filter.searchText = this.searchText;
                this.getCandidate();
            }
            if (!this.searchText) {
                this.ApplicantList = [];
                this.totalRecords = 0;
                this.filter.searchText = '';
                this.totalRecords = 0;
                this.getCandidate();
            }
        }

    }

    getJobsName(jobId) {
        this.jobService.getJobsName(jobId).subscribe(result => {
            if (result['success'] && result['success']['data'] && result['success']['data'].length) {
                this.job = result['success']['data'][0];
            }
        });
    }

    ngOnInit() {
        this.gettingApplicant = true;
        this.getCandidate();
    }

    getCandidate() {
        this.searchService.getReferredApplicantData(this.filter).subscribe((result) => {
            if (result['success'] && result['success']['data']) {
                this.ApplicantList = result['success']['data'].applicants;
                this.totalRecords = result['success']['data'].total;

            }
            this.gettingApplicant = false;
        }, () => {
            this.gettingApplicant = false;
        });
    }

    openCandidate(applicantId: any) {
        this.applicant = {_id: applicantId, isApplicantList: true};
        SiteJS.slideOpen('applicant-info');
    }

    getName(applicant) {
        let name = '';
        if (applicant.firstName) {
            name = name + ' ' + applicant.firstName;
        }
        if (applicant.middleName) {
            name = name + ' ' + applicant.middleName;
        }
        if (applicant.lastName) {
            name = name + ' ' + applicant.lastName;
        }

        return name;
    }

    getFullName(firstName, middleName, lastName) {
        let name = firstName;
        if (middleName && middleName != 'null') name = name + ' ' + middleName;
        if (lastName && lastName != 'null') name = name + ' ' + lastName;
        return name;
    }

    addApplicantToJob(applicantId: any) {
        this.jobService.addJobApplicant({
            jobId: this.jobId,
            pipelineId: this.pipeId,
            applicantId: applicantId
        }).subscribe(result => {
            if (result['success'] && result['success']['data']) {
            } else {
            }
        });
    }

    goToCreate() {
        // this.router.navigate(['applicants/create']);
        this.modalRef = this.modalService.show(CreateReferredApplicantComponent, {
            class: 'modal-lg', initialState: null
        });
        this.modalRef.content.closePopup.subscribe(result => {
            if (result) {
                this.getCandidate();
            }
        });
    }

    searchJob() {
        localStorage.removeItem('jid');
        localStorage.setItem('jid', JSON.stringify({
            id: null,
            title: null,
            cName: null,
            pipeId: null
        }));
        // this.router.navigate(['applicants/create']);
        this.modalRef = this.modalService.show(CreateApplicantComponent, {
            class: 'modal-lg', initialState: null
        });
        this.modalRef.content.closePopup.subscribe(result => {
            if (result) {
                /*this.ApplicantList.unshift(result['data']);
                this.totalRecords++;*/
                this.getCandidate();
            }
        });
    }

    onFilterChange(filter: any) {
        this.filter.offset = (filter.pageIndex - 1) * filter.pageSize;
        this.filter.pageSize = filter.pageSize;
        this.filter.pageIndex = filter.pageIndex;
        this.getCandidate();

    }

    uploadResume() {
        this.router.navigate(['/referred-applicants/job']);
    }

    onUpdate($event) {
        for (let i = 0; i < this.ApplicantList.length; i++) {
            if ($event._id == this.ApplicantList[i]._id) {
                this.ApplicantList[i] = $event;
            }
        }
    }

    getDate(date) {
        const month = date.getMonth() + 1;
        return month + '/' + date.getDate() + '/' + date.getFullYear();
    }
}
