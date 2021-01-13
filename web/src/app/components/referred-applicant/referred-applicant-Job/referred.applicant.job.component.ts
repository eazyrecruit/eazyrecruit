import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';
import {JobService} from '../../../services/job.service';
import {SharedService} from '../../../services/shared.service';
import {DataShareService} from '../../../services/data-share.service';
import {ConstService} from '../../../services/const.service';
import {JobComponent} from '../../jobs/job/job.component';
import {CreateReferredApplicantComponent} from '../create-referred-applicant/create.referred.applicant.component';

@Component({
    selector: 'app-jobs',
    templateUrl: 'referred.applicant.job.component.html',
    providers: [JobService, SharedService]
})
export class ReferredApplicantJobComponent implements OnInit {
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
            offset: 0
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
        this.jobService.getHrAdmin().subscribe(result => {
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
        this.jobService.getJob(this.filter).subscribe(result => {
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

    filterChanged(refilter) {
        if (refilter == false) {
            this.filter.pageIndex = this.CurrentPage;
            this.filter.offset = (this.CurrentPage - 1) * this.filter.pageSize;
            this.searchJob();
        }
    }
}
