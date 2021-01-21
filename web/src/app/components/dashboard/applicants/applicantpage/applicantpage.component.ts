import {
    Component,
    OnInit,
    Input,
    OnDestroy,
    Output,
    EventEmitter
} from '@angular/core';
import {ApplicantDataService} from '../../../../services/applicant-data.service';
import {ActivatedRoute, Router} from '@angular/router';
import {UploadService} from '../../../../services/upload.service';
import {ApplicantInfoService} from '../../../common/applicantInfo/applicant-info.service';
import {ValidationService} from '../../../../services/validation.service';
import {SearchService} from '../../../../services/search.service';
import {Subscription} from "rxjs";

declare var SiteJS: any;

@Component({
    selector: 'app-applicantpage',
    templateUrl: './applicantpage.component.html',
    providers: [UploadService, SearchService, ApplicantInfoService, ValidationService]
})

export class ApplicantpageComponent implements OnInit, OnDestroy {
    gettingApplicant = false;
    jobLoad = false;
    jobId: any;
    jobsSkils = {};
    isActivityUpdate = true;
    SkillDiv = '';
    applicantId: string;
    showComments = false;
    applyJobs: any = [];
    @Input()
    applicant?: any;

    @Output()
    onReject: EventEmitter<any> = new EventEmitter();

    @Output()
    onUpdate: EventEmitter<any> = new EventEmitter();
    @Output()
    onCancelInterview: EventEmitter<any> = new EventEmitter();

    applicantData?: any;
    private _subs: Subscription;

    constructor(
        private router: Router,
        private applicantInfoService: ApplicantInfoService,
        private applicantDataService: ApplicantDataService,
        private route: ActivatedRoute,
    ) {
    }


    commentAdded() {
        this.isActivityUpdate = !this.isActivityUpdate;
    }

    getFullName(firstName, middleName, lastName) {
        let name = firstName;
        if (middleName && middleName != 'null') name = name + ' ' + middleName;
        if (lastName && lastName != 'null') name = name + ' ' + lastName;
        return name;
    }

    setJobsSkils(jobsApplicants) {
        this.jobsSkils = {};
        this.applyJobs = [];
        for (let index = 0; index < jobsApplicants.length; index++) {
            const job = jobsApplicants[index].job || {};
            this.jobId = job._id;
            job['pipeline'] = jobsApplicants[index].pipeline;
            this.applyJobs.push(job);
            if (job.skills && job.skills.length) {
                for (let count = 0; count < job.skills.length; count++) {
                    this.jobsSkils[job.skills[count].name.toUpperCase()] = job.skills[count].name;
                }
            }
        }
        this.jobLoad = true;

    }

    onUpdateProfile(result) {
        this.isActivityUpdate = !this.isActivityUpdate;
        this.applicantData = result;
        this.onUpdate.emit(result);
        this.getApplicantCompleteData();
    }

    onCancelInterviewData(result) {
        this.isActivityUpdate = !this.isActivityUpdate;
        this.onCancelInterview.emit(result);
    }

    onUpdateInterview(result) {
        this.isActivityUpdate = !this.isActivityUpdate;
    }

    ngOnInit() {
        this.route.params.subscribe((params) => {
            this.applicantId = params['id'];
            this.getApplicantCompleteData();
            this.getJobsByApplicantId();
        });

    }

    getApplicantCompleteData() {
         this._subs = this.applicantDataService.getApplicantCompleteData(this.applicantId).subscribe(result => {
            if (result && result['success'] && result['success']['data']) {
                this.applicantData = result['success']['data'];
            }
        }, (error) => {
            SiteJS.stopLoader();
        });

    }

    getJobsByApplicantId() {
        this.applicantInfoService.getJobsByApplicantId(this.applicantId).subscribe(result => {
            if (result && result['success'] && result['success']['data'] && result['success']['data'].length) {
                this.setJobsSkils(result['success']['data']);
            }
        }, () => {
            this.jobLoad = true;
        });
    }

    ngOnDestroy(): void {
        this.applicantId = null;
        if (this._subs) {
            this._subs.unsubscribe();
        }
    }
}
