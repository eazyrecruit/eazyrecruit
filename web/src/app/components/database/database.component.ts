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

declare var SiteJS: any;

@Component({
    selector: 'app-profile',
    templateUrl: 'database.component.html',
    providers: [SearchService, JobService, ApplyJobService, ApplicantService, ApplicantDataService, BsModalService]
})
export class DatabaseComponent implements OnInit {

    filter = {
        pageIndex: 1, pageSize: 10, offset: 0, sortBy: 'modified_at', isGridView: false,
        order: -1, searchText: '', startDate: '', endDate: '', source: '',
    };
    pipeLines = [];
    totalRecords = 1;
    gettingApplicant = false;
    bsConfig = Object.assign({}, {containerClass: 'theme-red'});
    searchText = '';
    sourceType = ['Email', 'Upload', 'Website', 'Db'];
    job: any;
    startDate: any = new Date();
    endDate: any = new Date();
    startMaxDate: any = new Date();
    endMinDate: any = new Date();
    endMaxDate: any = new Date();


    searchForm: FormGroup;
    applicantJobs: FormGroup;
    applicantForm: FormGroup;
    params: any = {};
    limit = 10;
    offset = 0;
    file: File;
    candidates = [];
    ApplicantList = [];
    isJobSelected: Boolean;
    applicant: any;
    dataTableName = 'applicant';
    isResultAvailable = false;
    modalRef: BsModalRef;

    jobId: any;
    pipeId: any;

    @Output()
    onSelect: EventEmitter<any> = new EventEmitter();

    constructor(private searchService: SearchService,
                private fb: FormBuilder,
                private jobService: JobService,
                private applyJobService: ApplyJobService,
                private router: Router,
                private activateRoute: ActivatedRoute,
                private applicantService: ApplicantService,
                private applicantDataService: ApplicantDataService,
                private modalService: BsModalService) {

        this.applicantJobs = fb.group({
            job: [null, []]
        });

        this.applicantForm = fb.group({
            selectedResult: [null]
        });

        this.activateRoute.params.subscribe((params) => {
            this.jobId = params.jobId ? params.jobId : null;
            this.pipeId = params.pipelineId ? params.pipelineId : null;
            if (this.jobId) {
                this.getJobsName(this.jobId);
            }
        });
    }


    onDateChange(event, id) {
        if (id === 'startDate') {
            this.filter.startDate = this.getDate(new Date(event));
            this.endMinDate = new Date(event);
            this.startDate = new Date(event);
        } else if (id === 'endDate') {
            this.endDate = new Date(event);
            this.filter.endDate = this.getDate(new Date(event));
            if (this.filter.endDate && this.filter.startDate) {
                console.log('event', event);

            }
        }
        this.ApplicantList = [];
        this.totalRecords = 0;
        this.getCandidate();

    }

    onSourceFilterChange(item) {
        console.log('onSourceFilterChange1', item);
        if (item === 'Source') {
            item = '';
        }
        if (this.filter.source !== item) {
            this.filter.source = item;
            this.ApplicantList = [];
            this.totalRecords = 0;
            this.getCandidate();
        }


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
        console.log('onSearch');
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
                console.log('this.jobs', this.job);
            }
        });
    }

    ngOnInit() {
        this.startDate.setMonth(new Date().getMonth() - 2);
        this.endMinDate = this.startDate;
        this.filter.startDate = this.getDate(this.startDate);
        this.filter.endDate = this.getDate(this.endDate);
        this.gettingApplicant = true;
        this.getCandidate();
    }

    getCandidate() {
        this.searchService.getApplicantData(this.filter).subscribe((result) => {
            if (result['success'] && result['success']['data']) {
                this.ApplicantList = result['success']['data'].applicants;
                this.totalRecords = result['success']['data'].total;
                console.log('this.ApplicantList', this.ApplicantList);

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

    /*    resetfilter(filter) {
            this.filter = {
                pageIndex: filter.pageIndex,
                pageSize: filter.pageSize,
                searchText: filter.searchText,
                sortField: filter.sortField,
                sortOrder: filter.sortOrder
            };
        }*/

    goToCreate() {
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
        console.log('onFilterChange', filter);
        this.filter.offset = (filter.pageIndex - 1) * filter.pageSize;
        this.filter.pageSize = filter.pageSize;
        this.filter.pageIndex = filter.pageIndex;
        this.getCandidate();

    }

    // getCandidates(limit: any, offset: any) {
    //   this.applicantService.getAllCandidates(this.filter).subscribe(result => {
    //     if (result['success']) {
    //       this.candidates = result['success']['data'];
    //       this.toasterService.pop('success', 'Retreived successfully', 'Data retreived.');
    //     }
    //   });
    // }

    uploadResume() {
        this.modalRef = this.modalService.show(UploadResumeComponent);
        this.modalRef.content.onClose.subscribe(result => {
            if (result) {
                this.getCandidate();
                //this.toasterService.pop('success', 'Success', 'Resume uploaded successfully.');
            }
        });
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
