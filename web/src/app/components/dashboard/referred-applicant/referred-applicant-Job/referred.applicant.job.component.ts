import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';
import {JobService} from '../../../../services/job.service';
import {SharedService} from '../../../../services/shared.service';
import {DataShareService} from '../../../../services/data-share.service';
import {ConstService} from '../../../../services/const.service';
import {JobComponent} from '../../../common/job/job.component';
import {CreateReferredApplicantComponent} from '../create-referred-applicant/create.referred.applicant.component';
import {Subscription} from 'rxjs';

@Component({
    templateUrl: 'referred.applicant.job.component.html',
    providers: [JobService, SharedService]
})
export class ReferredApplicantJobComponent implements OnInit, OnDestroy {
    url: any;
    jobs = [];
    limit = 10;
    offset = 0;
    jobId = 0;
    job: any;
    jobDetails: FormGroup;
    filter: any;
    modalRef: BsModalRef;
    totalItems = 0;
    CurrentPage: any = 1;
    userList = [];
    jobLoading = false;
    private _subs: Subscription;

    constructor(private jobService: JobService,
                private sharedService: SharedService,
                private router: Router,
                private dataShared: DataShareService,
                private constService: ConstService,
                private modalService: BsModalService,
                private fbForm: FormBuilder) {
        this.url = this.constService.publicUrl;
        this.jobDetails = this.fbForm.group({
            title: [null, [<any>Validators.required]]
        });
    }

    ngOnInit() {
        this.getUser();
        this.filter = {
            pageIndex: 1,
            pageSize: 12,
            searchText: 'title',
            sortField: '',
            sortOrder: '1',
            offset: 0,
            basic: true
        };
        this.jobLoading = true;
        this.searchJob();
    }

    viewJob(job) {
        this.modalRef = this.modalService.show(JobComponent, {
            class: 'modal-lg',
            initialState: {job: job, userList: this.userList, isView: true}
        });
    }

    getUser() {
        this._subs = this._subs = this.jobService.getJobsUser().subscribe(result => {
            if (result['success'] && result['success'].data) {
                this.userList = result['success'].data;
            }
        });
    }

    uploadResume(jobId) {
        const initialState = {jobId: jobId};
        this.modalRef = this.modalService.show(CreateReferredApplicantComponent, {
            class: 'modal-lg',
            initialState: initialState
        });
        this.modalRef.content.closePopup.subscribe(result => {

        });
    }

    searchApplicant(jobId) {
        this.router.navigate(['/referred-applicants/add/job', jobId._id]);
    }

    searchJob(event: any = '') {
        this.filter.searchText = event.target ? event.target.value : event;
        this._subs = this.jobService.getJob(this.filter).subscribe(result => {
            if (result['success'] && result['success']['data']) {
                this.jobs = result['success']['data']['jobs'];
                // this.dataShared.notificationChangeMessage({ name: 'success', type: 'Success', message: 'No active job found' })
                this.totalItems = result['success']['data']['count'];
            }
            this.jobLoading = false;
        }, (err) => {
            this.jobs = [];
            this.jobLoading = false;
        });
    }

    onFilterChange(filter: any) {
        this.filter.offset = (filter.pageIndex - 1) * filter.pageSize;
        this.filter.pageSize = filter.pageSize;
        this.filter.pageIndex = filter.pageIndex;
        this.searchJob();

    }

    ngOnDestroy(): void {
        if (this._subs) {
            this._subs.unsubscribe();
        }
    }
}
