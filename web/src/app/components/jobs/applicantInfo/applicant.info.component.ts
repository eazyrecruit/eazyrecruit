import { Component, OnInit, Input, Output, EventEmitter, OnChanges, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UploadService } from '../../../services/upload.service';
import { SearchService } from '../../../services/search.service';
import { saveAs } from 'file-saver';
import { ApplicantInfoService } from './applicant-info.service';
import { ValidationService } from '../../../services/validation.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { InterviewService } from '../../../services/interview.service';
import { SchedulerComponent } from '../../interview/scheduler/scheduler.component';
import { AccountService } from '../../../services/account.service';
import { ActivatedRoute, Params } from '@angular/router';
import { CreateApplicantComponent } from '../../applicants/create-applicant/create-applicant.component';

declare global {
    interface Window { editApplicantPopup: any; }
}

@Component({
    selector: 'applicant-info',
    templateUrl: './applicant.info.component.html',
    providers: [UploadService, SearchService, ApplicantInfoService, ValidationService, InterviewService, AccountService]
})
export class ApplicantInfoComponent implements OnInit, OnChanges {

    resume: any;
    resumeId: any;
    defaultColor = 'label label-default';
    matchedColor = 'label label-success';
    rejectionDetails: FormGroup;
    applicantHistory: any = [];
    jobPostApplicantId: any;
    jobId: any;
    appliedJob = [];
    applicantDetails: any;
    modalRef: BsModalRef;
    scheduledInterviews: Array<any>;
    interviewers: Array<any>;

    @Input()
    applicant?: any;

    @Output()
    onReject: EventEmitter<any> = new EventEmitter();

    @Output()
    onUpdate: EventEmitter<any> = new EventEmitter();

    constructor(
        private route: ActivatedRoute,
        private uploadService: UploadService,
        private searchService: SearchService,
        private interviewService: InterviewService,
        private fb: FormBuilder,
        private applicantInfoService: ApplicantInfoService,
        private validationService: ValidationService,
        private modalService: BsModalService,
        private accountService: AccountService
    ) {
        this.rejectionDetails = this.fb.group({
            comment: [null, [<any>Validators.required]]
        });
    }

    ngOnInit() {
        //get jobId
        this.jobId = this.route.params['value'].jobId;
        this.applicant = null;
    }

    ngOnChanges() {
        if (this.applicant) {
            this.getApplicantById(this.applicant._id);
        }
    }

    schduleInterview() {
        this.modalRef = this.modalService.show(SchedulerComponent, {
            initialState: {
                event: {
                    start: new Date(),
                    end: new Date(),
                    extendedProps:
                    {
                        jobApplicant: this.applicant._id,
                        jobId: this.jobId
                    }
                }
            }
        });
        this.modalRef.content.close = (data) => {
            if (data) this.scheduledInterviews.push(data);
            this.modalRef.hide();
        }
    }

    openInterview(interview, index) {
        this.modalRef = this.modalService.show(SchedulerComponent, {
            initialState: {
                event: {
                    extendedProps: interview,
                    start: interview.start,
                    end: interview.end,
                    interviewId: interview._id
                }
            }
        });
        this.modalRef.content.close = (data) => {
            this.scheduledInterviews[index] = data;
            this.modalRef.hide();
        }
    }

    getScheduledInterviews() {
        this.getAllUsers();
        if (this.applicant) {
            this.interviewService.getInterviewsByCandidate(this.applicant._id).subscribe(result => {
                if (result['success']) this.scheduledInterviews = result['success'].data;
            });
        }
    }

    getRejections(id: any) {
        this.applicantInfoService.getRejections(id).subscribe(result => {
            if (result['success']) {
                this.applicant.comments = result['success']['data'];
            }
        });
    }

    rejectCandidate(comment: any) {
        if (!this.rejectionDetails.valid) {
            this.validationService.validateAllFormFields(this.rejectionDetails);
        }
        if (this.rejectionDetails.valid) {
            const obj: any = {};
            obj.applicantId = this.applicant.applicant_id;
            obj.jobPostId = this.applicant.job_post_id;
            obj.comment = comment.comment;
            this.applicantInfoService.reject(obj).subscribe(result => {
                if (result['success']) {
                    this.rejectionDetails.reset();
                    this.applicant.disableReject = true;
                    // this.getRejections(obj.id);
                    this.onReject.emit('candiateRemoved');
                }
            });
        }
    }

    getApplicantHistory() {
        if (this.jobId && this.applicant && this.applicant._id) {
            this.applicantInfoService.getHistory(this.applicant._id, this.jobId).subscribe(result => {
                const data = result['success']['data'];
                if (data) {
                    this.applicantHistory = data.length > 0 ? data : [];
                } else {
                    this.applicantHistory = [];
                }
            });
        }
    }

    getRejectHistory(id: any, jobId: any, i) {
        this.applicantInfoService.getRejectHistory(id, jobId).subscribe(result => {
            if (result['success']['data']) {
                this.applicantHistory[i].rejectionHistory = result['success']['data'][0].applicant_comments;
            } else {
                alert('Error');
            }
        });
    }

    getAppliedJob(applicantId) {
        this.applicantInfoService.getAppliedJob(applicantId).subscribe(result => {
            if (result['success']['data']) {
                this.appliedJob = result['success']['data'];
            }
        });
    }

    editApplicant(applicant, template: TemplateRef<any>) {
        const close = document.getElementById('closed-panel');
        close.click();
        window.editApplicantPopup = document.getElementById('closeButton');
        this.applicantDetails = applicant;
    }

    // This need to impliment
    // getEducationById(applicantId: any) {
    //     if (applicantId) {
    //         this.applicantInfoService.getEducationById(applicantId).subscribe(result => {
    //             if (result['success']['data']) {
    //                 console.log('education', result);
    //             }
    //         });
    //     }
    // }

    getExperienceById(applicantId: any) {
        if (applicantId) {
            this.applicantInfoService.getExperienceById(applicantId).subscribe(result => {
                if (result['success']['data']) {
                    this.applicant.applicant.experiences = result['success']['data'];
                }
            });
        }
    }

    getDisplayName(userId) {
        if (this.interviewers) {
            var ivrs = this.interviewers.filter(ivr => ivr._id == userId);
            if (ivrs && ivrs.length > 0) {
                return this.applicant.fullName(ivrs[0].firstName, ivrs[0].middleName, ivrs[0].lastName)
            }
        }
        return "Display name";
    }

    getAllUsers() {
        this.accountService.getAllUsers({ offset: 0, pageSize: 10, searchText: '' }).subscribe(result => {
            if (result['success']['data'].length) {
                this.interviewers = result['success']['data'];
            }
        });

    }

    getApplicantById(id: string) {
        this.applicantInfoService.getApplicantById(id).subscribe(result => {
            if (result) {
                // console.log('applicant result ===>>> ', result['success']['data']);
                this.applicant = result['success']['data'];
                this.applicant.fullName = this.getFullName.bind(this.applicant);
            }
        });
    }

    getJobsByApplicantId() {
        if (this.applicant && this.applicant._id) {
            this.applicantInfoService.getJobsByApplicantId(this.applicant._id).subscribe(result => {
                if (result) {
                    // console.log('applicant job result ===>>> ', result['success']['data']);
                    this.applicant.jobs = result['success']['data'];
                }
            });
        }
    }

    getFullName(firstName, middleName, lastName) {
        var name = firstName;
        if (middleName && middleName != "null") name = name + " " + middleName;
        if (lastName && lastName != "null") name = name + " " + lastName;
        return name;
    }

    updateApplicant() {
        this.modalRef = this.modalService.show(CreateApplicantComponent, { 
            class: 'modal-lg', 
            initialState: { applicant: this.applicant } 
        });
        this.modalRef.content.closePopup.subscribe(result => {
            if (result) {
                this.applicant = result['data'];
                this.applicant.fullName = this.getFullName.bind(this.applicant);
                this.onUpdate.emit(this.applicant);
            }
        });
    }
}
