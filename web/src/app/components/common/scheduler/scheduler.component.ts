import {Component, OnInit, OnDestroy} from '@angular/core';
import {BsModalRef} from 'ngx-bootstrap';
import {FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import {AccountService, AuthStorage} from '../../../services/account.service';
import {JobService} from '../../../services/job.service';
import {ApplicantDataService} from '../../../services/applicant-data.service';
import {InterviewService} from '../../../services/interview.service';
import {DatePipe} from '@angular/common';
import {ApplicantInfoService} from '../applicantInfo/applicant-info.service';
import {ToasterService} from "angular2-toaster";
import {Subscription} from "rxjs";

const month = {
    0: 'Jan',
    1: 'Feb',
    2: 'Mar',
    3: 'Apr',
    4: 'May',
    5: 'Jun',
    6: 'Jul',
    7: 'Aug',
    8: 'Sep',
    9: 'Oct',
    10: 'Nov',
    11: 'Dec'
};

@Component({
    selector: 'app-scheduler',
    templateUrl: './scheduler.component.html',
    providers: [JobService, AccountService, ApplicantDataService, ApplicantInfoService, InterviewService, AuthStorage, DatePipe]
})
export class SchedulerComponent implements OnInit, OnDestroy {

    interviewForm: FormGroup;
    bsConfig = Object.assign({}, {containerClass: 'theme-red'});
    event: any;
    interviewers: Array<any>;
    candidate: any;
    job: any;
    interviewer: any;
    organizer: any;
    close: any;
    currentDate;
    endDateValid = true;
    startDateValid = true;
    submit = false;
    channels = ['GoLiveMeet', 'Skype', 'Online', 'Google Meet', 'F2F', 'Telephonic'];
    startString: string;
    endString: string;
    startTimeString: string;
    endTimeString: string;
    startConString: string;
    endConString: string;
    appliedJobs: any;
    appliedJob: any;
    role: any;
    private _subs: Subscription;

    constructor(
        public modalRef: BsModalRef,
        private formBuilder: FormBuilder,
        private accountService: AccountService,
        private jobService: JobService,
        private toasterService: ToasterService,
        private applicantDataService: ApplicantDataService,
        private applicantInfoService: ApplicantInfoService,
        private interviewService: InterviewService,
        private authStorage: AuthStorage,
        private datePipe: DatePipe
    ) {
        this.currentDate = Date.now();
        this.interviewForm = this.formBuilder.group({
            title: [null, [<any>Validators.required]],
            start: [null, [<any>Validators.required]],
            end: [null, [<any>Validators.required]],
            startTime: [null, [<any>Validators.required]],
            endTime: [null, [<any>Validators.required]],
            candidateId: [null],
            candidateName: [null],
            interviewerId: [null, [<any>Validators.required]],
            channel: [null],
            channelLink: [null],
            note: [null],
            round: [null],
            id: [null]
        });
    }

    onInterviwerChange(event) {
        if (event && event.target && event.target.value && event.target.value !== '') {
            this.interviewer = this.interviewers.find(i => i._id == event.target.value);
        }
    }

    onChanelChange(event) {
        if (event === 'GoLiveMeet') {
            this.interviewForm.get('channelLink').setValue('');
        }

    }

    onJobChange(event) {
        if (event && event.target && event.target.value) {
            this.job = this.appliedJobs.find(j => j.job._id == event.target.value).job;
        }
    }

    ngOnInit() {
        this.role = this.accountService.getRole();
        this.getAllUsers();
        this.getCandidateDetails();
        this.setJobDetails();
        this.setFormValues();
        this.setOrganizer();
    }

    setFormValues() {
        if (this.event.extendedProps.interviewer) {
            if (this.event) {
                this.event.start = new Date(new Date(this.event.start).toString());
                this.event.end = new Date(this.event.end).toString();
                this.startString = this.datePipe.transform(this.event.start, 'MM-dd-yyyy');
                this.endString = this.datePipe.transform(this.event.end, 'MM-dd-yyyy');
                this.event.start = new Date(this.startString);
                this.event.end = new Date(this.endString);

                this.interviewForm.get('id').setValue(this.event.interviewId ? this.event.interviewId : this.event.id);
                this.interviewForm.get('start').setValue(this.event.start);
                this.interviewForm.get('startTime').setValue(this.event.extendedProps.start);
                this.interviewForm.get('end').setValue(this.event.end);
                this.interviewForm.get('endTime').setValue(this.event.extendedProps.end);
                if (this.event.extendedProps) {
                    this.interviewForm.get('channelLink').setValue(this.event.extendedProps.channelLink);
                    this.interviewForm.get('note').setValue(this.event.extendedProps.note);
                    this.interviewForm.get('channel').setValue(this.event.extendedProps.channel);
                    this.interviewForm.get('round').setValue(this.event.extendedProps.round);
                }
            }
        } else {
            if (this.event) {
                const startDate = new Date(this.currentDate);
                const endDate = new Date(this.currentDate);
                const hours = startDate.getHours() + 1;
                endDate.setHours(hours);
                const min = startDate.getMinutes();
                if (min > 30) {
                    startDate.setMinutes(0);
                    startDate.setHours(startDate.getHours() + 1);
                    endDate.setMinutes(0);
                    endDate.setHours(endDate.getHours() + 1);
                } else {
                    startDate.setMinutes(30);
                    endDate.setMinutes(30);
                }

                this.interviewForm.get('id').setValue(this.event.interviewId);
                this.interviewForm.get('start').setValue(startDate);
                this.interviewForm.get('startTime').setValue(startDate);
                this.interviewForm.get('end').setValue(endDate);
                this.interviewForm.get('endTime').setValue(endDate);
                if (this.event.extendedProps) {
                    this.interviewForm.get('channelLink').setValue(this.event.extendedProps.channelLink || '');
                    this.interviewForm.get('note').setValue(this.event.extendedProps.note);
                    this.interviewForm.get('channel').setValue(this.event.extendedProps.channel);
                    this.interviewForm.get('round').setValue(this.event.extendedProps.round);
                }
            }
        }
    }

    getAllUsers() {
        this._subs = this.accountService.getAllUsers({
            offset: 0,
            pageSize: 0,
            searchText: '',
            all: true
        }).subscribe(result => {
            if (result['success'] && result['success']['data'] && result['success']['data']['users'].length) {
                this.interviewers = result['success']['data']['users'];
                this.interviewForm.get('interviewerId').setValue(this.event.extendedProps.interviewer);
            }
        });
    }

    getCandidateDetails() {
        if (this.event && this.event.extendedProps && this.event.extendedProps.jobApplicant) {
             this._subs = this.applicantDataService.getApplicantCompleteData(this.event.extendedProps.jobApplicant._id ? this.event.extendedProps.jobApplicant._id : this.event.extendedProps.jobApplicant)
                .subscribe(result => {
                    if (result['success'] && result['success']['data']) {
                        this.candidate = result['success']['data'];
                        this.interviewForm.get('candidateId').setValue(this.candidate._id);
                        const candidatename = this.getFullName(this.candidate.firstName, this.candidate.middleName, this.candidate.lastName);
                        this.interviewForm.get('candidateName').setValue(`${candidatename}<${this.candidate.email}>`);
                    }
                });
        }
    }

    setJobDetails() {
        if (this.event && this.event && this.event.extendedProps.jobId) {
             this._subs = this.jobService.getJobById(this.event.extendedProps.jobId).subscribe(result => {
                if (result['success'] && result['success']['data']) {
                    this.job = result['success']['data'];
                    this.interviewForm.get('title').setValue(this.job.title);
                }
            });
        } else {
            this.applicantInfoService.getJobsByApplicantId(this.event.extendedProps.jobApplicant).subscribe(result => {
                if (result['success'] && result['success']['data']) {
                    this.appliedJobs = result['success']['data'];
                }
            });
        }
    }

    setOrganizer() {
        this.organizer = this.authStorage.getAuthData().data;
    }

    schduleInterview(interviewFormData) {
        this.submit = true;
        this.startString = this.datePipe.transform(interviewFormData.start, 'yyyy-MM-dd');
        this.endString = this.datePipe.transform(interviewFormData.end, 'yyyy-MM-dd');
        this.startTimeString = this.datePipe.transform(interviewFormData.startTime, 'HH:mm');
        this.endTimeString = this.datePipe.transform(interviewFormData.endTime, 'HH:mm');
        this.startConString = this.startString + 'T' + this.startTimeString;
        this.endConString = this.endString + 'T' + this.endTimeString;
        interviewFormData.start = new Date(this.startConString);
        interviewFormData.end = new Date(this.endConString);

        if (this.event.extendedProps.interviewer && this.event.extendedProps.interviewer !== '') {
            this.interviewer = this.interviewers.find(i => i._id == interviewFormData.interviewerId);
        }

        if (interviewFormData.start >= this.currentDate) this.startDateValid = true;
        else this.startDateValid = false;
        if (interviewFormData.end > interviewFormData.start) this.endDateValid = true;
        else this.endDateValid = false;

        if (this.endDateValid && this.startDateValid && this.interviewForm.valid) {
            const interview = {
                job: {
                    id: this.job._id,
                    name: this.job.title
                },
                localStartDate: this.getFormattedDate(interviewFormData.start),
                localStartTime: this.getTime(interviewFormData.start),
                start: interviewFormData.start.toUTCString(),
                end: interviewFormData.end.toUTCString(),
                startTime: interviewFormData.start.toUTCString(),
                endTime: interviewFormData.end.toUTCString(),
                channel: interviewFormData.channel,
                channelLink: interviewFormData.channelLink,
                note: interviewFormData.note,
                round: interviewFormData.round,
                candidate: {
                    id: interviewFormData.candidateId,
                    name: this.getFullName(this.candidate.firstName,
                        this.candidate.middleName, this.candidate.lastName),
                    email: this.candidate.email
                },
                interviewer: {
                    id: interviewFormData.interviewerId,
                    name: this.interviewer.firstName ? this.getFullName(this.interviewer.firstName, null, this.interviewer.lastName) : this.interviewer.email,
                    email: this.interviewer.email
                },
                organizer: {
                    id: this.organizer.id,
                    name: this.organizer.displayName,
                    email: this.organizer.email
                },
                created_by: {
                    id: this.organizer.id,
                    name: this.organizer.displayName,
                    email: this.organizer.email
                },
                modified_by: this.organizer.id
            };

            // tslint:disable-next-line:one-line
            if (this.event.extendedProps.interviewer) {
                this._subs = this.interviewService.reschedule(interview, interviewFormData.id, this.event.extendedProps.sequence).subscribe(result => {
                    if (result['success']) {
                        this.close(result['success'].data);
                    } else {
                        this.toasterService.pop('error', 'Error in schedule interview', result['error'].data);
                    }
                }, (error: any) => {
                    console.log(error);
                });
            } else {
                this._subs = this.interviewService.schedule(interview, interviewFormData.id).subscribe(result => {
                    if (result['success']) {
                        this.close(result['success'].data);
                    } else {
                        this.toasterService.pop('error', 'Error in schedule interview', result['error'].data);
                    }
                }, (error) => {
                    this.toasterService.pop('error', 'Error in schedule interview', error);
                });
            }
        }
    }

    getTime(date) {

        let hours = date.getHours();
        const minutes = date.getMinutes();

        // Check whether AM or PM
        const newformat = hours >= 12 ? 'PM' : 'AM';

        // Find current hour in AM-PM Format
        hours = hours % 12;

        // To display "0" as "12"
        hours = hours ? hours : 12;
        const minute = minutes < 10 ? '0' + minutes : minutes;
        return hours + ':' + minute + ' ' + newformat;

    }

    getFormattedDate(date) {
        return month[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
    }

    getFullName(firstName, middleName, lastName) {
        let name = firstName;
        if (middleName) name = name + ' ' + middleName;
        if (lastName) name = name + ' ' + lastName;
        return name;
    }

    ngOnDestroy(): void {
        if (this._subs) {
            this._subs.unsubscribe();
        }
    }
}
