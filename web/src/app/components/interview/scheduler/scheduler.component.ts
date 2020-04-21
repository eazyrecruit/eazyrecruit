import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AccountService, AuthStorage } from '../../../services/account.service';
import { JobService } from '../../../services/job.service';
import { ApplicantDataService } from '../../../services/applicant-data.service';
import { InterviewService } from '../../../services/interview.service';
import { last } from '@angular/router/src/utils/collection';
import { DatePipe } from '@angular/common';
import { ApplicantInfoService } from '../../jobs/applicantInfo/applicant-info.service';


@Component({
  selector: 'app-scheduler',
  templateUrl: './scheduler.component.html',
  styleUrls: ['./scheduler.component.css'],
  providers: [JobService, AccountService, ApplicantDataService, ApplicantInfoService, InterviewService, AuthStorage, DatePipe]
})
export class SchedulerComponent implements OnInit {

  interviewForm: FormGroup;
  bsConfig = Object.assign({}, { containerClass: 'theme-red' });
  event: any;
  interviewers: Array<any>;
  candidate: any;
  job: any;
  interviewer: any;
  organizer: any;
  close: any;
  currentDate;
  endDateValid:boolean = true;
  startDateValid: boolean = true;
  submit: boolean = false;
  startString: string;
  endString: string;
  startTimeString: string;
  endTimeString: string;
  startConString: string;
  endConString:string;
  appliedJobs: any;
  appliedJob: any;

  constructor(
    public modalRef: BsModalRef,
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private jobService: JobService,
    private applicantDataService: ApplicantDataService,
    private applicantInfoService: ApplicantInfoService,
    private interviewService: InterviewService,
    private authStorage: AuthStorage,
    private datePipe: DatePipe
  ) 
  
  {
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

  onJobChange(event) {
    if (event && event.target && event.target.value) {
      this.job = this.appliedJobs.find(j => j.job._id == event.target.value).job;
    }
  }

  ngOnInit() {
    this.getAllUsers();
    this.getCandidateDetails();
    this.setJobDetails();
    this.setFormValues();
    this.setOrganizer();
  }

  setFormValues() {
    if(this.event.extendedProps.interviewer){
      if (this.event){

        this.startString = this.datePipe.transform(this.event.start,'MM-dd-yyyy');
        this.endString = this.datePipe.transform(this.event.end,'MM-dd-yyyy');
        this.event.start = new Date(this.startString);
        this.event.end = new Date(this.endString);

        this.interviewForm.get('id').setValue(this.event.interviewId ? this.event.interviewId : this.event.id);
        this.interviewForm.get('start').setValue(this.event.start);
        this.interviewForm.get('startTime').setValue(this.event.extendedProps.start);
        this.interviewForm.get('end').setValue(this.event.end);
        this.interviewForm.get('endTime').setValue(this.event.extendedProps.end);
      if (this.event.extendedProps) {
        this.interviewForm.get('note').setValue(this.event.extendedProps.note);
        this.interviewForm.get('channel').setValue(this.event.extendedProps.channel);
        this.interviewForm.get('round').setValue(this.event.extendedProps.round);
      }
      }
    }
    else{
      if (this.event) {
        var startDate = new Date(this.currentDate);
        var endDate = new Date(this.currentDate);
        var hours=startDate.getHours()+1;
        endDate.setHours(hours);
        var min = startDate.getMinutes();
        if(min>30) 
        {
          startDate.setMinutes(0);
          startDate.setHours(startDate.getHours()+1);
          endDate.setMinutes(0);
          endDate.setHours(endDate.getHours()+1);
        }
        else
        {
          startDate.setMinutes(30);
          endDate.setMinutes(30);
        }
  
        this.interviewForm.get('id').setValue(this.event.interviewId);
        this.interviewForm.get('start').setValue(startDate);
        this.interviewForm.get('startTime').setValue(startDate);
        this.interviewForm.get('end').setValue(endDate);
        this.interviewForm.get('endTime').setValue(endDate);
        if (this.event.extendedProps) {
          this.interviewForm.get('note').setValue(this.event.extendedProps.note);
          this.interviewForm.get('channel').setValue(this.event.extendedProps.channel);
          this.interviewForm.get('round').setValue(this.event.extendedProps.round);
        }
      }
    }   
  }

  getAllUsers() {
    this.accountService.getAllUsers({ offset: 0, pageSize: 10, searchText: '' }).subscribe(result => {
      if (result['success'] && result['success']['data'] && result['success']['data']['users'].length) {
        this.interviewers = result['success']['data']['users'];
        this.interviewForm.get('interviewerId').setValue(this.event.extendedProps.interviewer);
      }
    });
  }

  getCandidateDetails() {
    if (this.event && this.event.extendedProps && this.event.extendedProps.jobApplicant) {
      this.applicantDataService.getApplicantCompleteData(this.event.extendedProps.jobApplicant._id ? this.event.extendedProps.jobApplicant._id : this.event.extendedProps.jobApplicant)
      .subscribe(result => {
        if (result['success'] && result['success']['data']) {
          this.candidate = result['success']['data'];
          this.interviewForm.get('candidateId').setValue(this.candidate._id);
          var candidatename = this.getFullName(this.candidate.firstName, this.candidate.middleName, this.candidate.lastName);
          this.interviewForm.get('candidateName').setValue(`${candidatename}<${this.candidate.email}>`);
        }
      });
    }
  }

  setJobDetails() {
    if (this.event && this.event && this.event.extendedProps.jobId) {
      this.jobService.getJobById(this.event.extendedProps.jobId).subscribe(result => {
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
      })
    }
  }

  setOrganizer(){
    this.organizer = this.authStorage.getAuthData().data;
  }

  schduleInterview(interviewFormData) {
    this.submit = true;
    this.startString = this.datePipe.transform(interviewFormData.start,'yyyy-MM-dd');
    this.endString = this.datePipe.transform(interviewFormData.end,'yyyy-MM-dd');
    this.startTimeString = this.datePipe.transform(interviewFormData.startTime,'HH:mm');
    this.endTimeString = this.datePipe.transform(interviewFormData.endTime,'HH:mm');
    this.startConString=this.startString+'T'+this.startTimeString;
    this.endConString=this.endString+'T'+this.endTimeString;
    interviewFormData.start = new Date(this.startConString);
    interviewFormData.end = new Date(this.endConString);
    
    if(this.event.extendedProps.interviewer && this.event.extendedProps.interviewer !== '') {
      this.interviewer = this.interviewers.find(i => i._id == interviewFormData.interviewerId);
    }

    if (interviewFormData.start >= this.currentDate) this.startDateValid = true;
      else this.startDateValid = false;
    if (interviewFormData.end > interviewFormData.start) this.endDateValid = true;
      else this.endDateValid = false;

      if(this.endDateValid && this.startDateValid && this.interviewForm.valid){
      var interview = {
        job: { 
          id: this.job._id, 
          name: this.job.title 
        },
        start: interviewFormData.start,
        end: interviewFormData.end,
        startTime: interviewFormData.start,
        endTime: interviewFormData.end,
        channel: interviewFormData.channel,
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
          name: this.interviewer.name,
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
      }

      if(this.event.extendedProps.interviewer){
        this.interviewService.reschedule(interview, interviewFormData.id, this.event.extendedProps.sequence).subscribe(result => {
          if (result['success']){
            this.close(result['success'].data);
          }
        });
      }
      else{
        this.interviewService.schedule(interview, interviewFormData.id).subscribe(result => {
          if(result['success']){
            this.close(result['success'].data);
          }
        });
      }
    }
  }

  getFullName(firstName, middleName, lastName) {
    var name = firstName;
    if (middleName) name = name + " " + middleName;
    if (lastName) name = name + " " + lastName;
    return name;
  }
}
