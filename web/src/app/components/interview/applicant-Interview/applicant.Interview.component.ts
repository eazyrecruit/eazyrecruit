import {Component, Input, OnChanges, Output, EventEmitter} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {InterviewService} from '../../../services/interview.service';
import {AccountService} from '../../../services/account.service';
import {SchedulerComponent} from '../scheduler/scheduler.component';
import {CancelConformComponent} from '../cancelConfromBox/cancel.conform.component';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';

@Component({
    selector: 'app-applicant-interview',
    templateUrl: 'applicant.Interview.component.html',
    providers: [InterviewService, AccountService]
})
export class ApplicantInterviewComponent implements OnChanges {
    isReadonly = true;
    scheduledInterviews: Array<any>;
    interviewers: Array<any>;
    @Input()
    applicant?: any;
    @Input()
    jobId: any;
    @Output()
    onCancelInterview: EventEmitter<any> = new EventEmitter();
    @Output()
    onOnInterViewUpdate: EventEmitter<any> = new EventEmitter();
    applicantData?: any;
    modalRef: BsModalRef;

    constructor(
        private route: ActivatedRoute,
        private interviewService: InterviewService,
        private modalService: BsModalService,
        private accountService: AccountService
    ) {
    }

    ngOnChanges() {
        this.getScheduledInterviews();
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
            this.onOnInterViewUpdate.emit(data);
            if (data) this.scheduledInterviews.push(data.interview || {});
            this.modalRef.hide();
        };
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
            this.scheduledInterviews[index] = data.interview || {};
            this.scheduledInterviews[index].interviewer = data.interviewer.id;
            this.modalRef.hide();
        };
    }

    getScheduledInterviews() {
        this.getAllUsers();
        if (this.applicant) {
            this.interviewService.getInterviewsByCandidate(this.applicant._id).subscribe(result => {
                if (result['success']) this.scheduledInterviews = result['success'].data;
            });
        }
    }

    openDeleteModel(deleteInterViewId) {
        this.modalRef = this.modalService.show(CancelConformComponent, {
            initialState: {
                deleteInterViewId: deleteInterViewId,
            }
        });
        this.modalRef.content.close = (data) => {
            if (data) {
                this.getScheduledInterviews();
                this.onCancelInterview.emit({});
            }

            this.modalRef.hide();
        };
    }

    getDisplayName(userId) {
        if (this.interviewers) {
            const ivrs = this.interviewers.filter(ivr => ivr._id == userId);
            if (ivrs && ivrs.length > 0) {
                if (ivrs[0].firstName) {
                    return this.getFullName(ivrs[0].firstName, ivrs[0].lastName, '');
                } else {
                    return this.getFullName(ivrs[0].email, '', '');
                }
            }
        }
        return 'Display name';
    }

    getAllUsers() {
        this.accountService.getAllUsers({offset: 0, pageSize: 10, searchText: '', all: true}).subscribe(result => {
            if (result['success']['data']) {
                this.interviewers = result['success']['data']['users'];
            }
        });

    }

    getFullName(firstName, middleName, lastName) {
        let name = firstName;
        if (middleName && middleName != 'null') name = name + ' ' + middleName;
        if (lastName && lastName != 'null') name = name + ' ' + lastName;
        return name;
    }
}
