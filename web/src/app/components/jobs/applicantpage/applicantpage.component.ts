import { Component, OnInit, Input, OnChanges, OnDestroy, ViewChild, TemplateRef, Output, EventEmitter } from '@angular/core';
import { ApplicantDataService } from '../../../services/applicant-data.service';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UploadService } from '../../../services/upload.service';
import { ApplicantInfoService } from '../applicantInfo/applicant-info.service';
import { ValidationService } from '../../../services/validation.service';
import { SearchService } from '../../../services/search.service';
import { saveAs } from 'file-saver';
import { CreateApplicantComponent } from '../../applicants/create-applicant/create-applicant.component';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';

declare var SiteJS: any;

@Component({
  selector: 'app-applicantpage',
  templateUrl: './applicantpage.component.html',
  styleUrls: ['./applicantpage.component.css'],
  providers: [UploadService, SearchService, ApplicantInfoService, ValidationService]
})

export class ApplicantpageComponent implements OnInit, OnDestroy {
  applicantId: string;
  applicant: any;
  fullName: string;
  personalInfo: any;
  addressesInfo: any;
  experiencesInfo: any;
  skills: any;
  errInvalidFile: boolean;
  resumeForm: FormGroup;
  resume: any;
  resumeId: any;
  isResumeUploading = false;
  isUploadDisabled = false;
  appliedJobs: any;
  applicantComments: any;
  dataSourceforPdf: String;
  pdf_url: string;
  applicantDetails: any;
  contractInfo: any;
  modalRef: BsModalRef;
  availability: any[];
  comments: any [];

  @Output()
    onUpdate: EventEmitter<any> = new EventEmitter();

  constructor(
    private applicantDataService: ApplicantDataService,
    private activatedRoute: ActivatedRoute,
    private uploadService: UploadService,
    private fb: FormBuilder,
    private validationService: ValidationService,
    private applicantInfoService: ApplicantInfoService,
    private modalService: BsModalService
  ) {
    this.resumeForm = this.fb.group({
      resume: [null, [<any>Validators.required]]
    });
  }

  ngOnInit() {
    this.getApplicantData(this.activatedRoute.snapshot.data['applicant'].success.data);
    this.availability = [
      'Immediate',
      'One Month',
      'Two Months',
      'More Than Two Months'
    ]
    this.getJobsByApplicantId();
    this.comments = [];
  }

  ngOnDestroy() {
    this.applicantId = null;
  }

  getApplicantData(applicant: any) {
    if (applicant) {
      if (applicant.firstName) {
        applicant.fullName = this.getFullName.bind(applicant);
      } else {
        this.fullName = this.getFullName.bind(applicant);
      }
        this.applicant = applicant;
    } else {
      SiteJS.stopLoader();
    }
  }

  getFullName(firstName, middleName, lastName) {
    var name = firstName;
    if (middleName && middleName != "null") name = name + " " + middleName;
    if (lastName && lastName != "null") name = name + " " + lastName;
    return name;
  }

  uploadResume() {
    const formData = new FormData();
    formData.append('resumeData', this.resume);
    formData.append('applicantId', this.applicant.personal.profile_id);
    if (!this.resumeForm.valid) {
      this.validationService.validateAllFormFields(this.resumeForm);
    }
    if (this.resumeForm.valid) {
      this.isResumeUploading = true;
      this.isUploadDisabled = true;
      this.uploadService.uploadResume(formData).subscribe(result => {
        if (result['success']) {
          this.resumeId = result['success']['data']._id;
          this.applicant.resume_id = this.resumeId;
          this.resumeForm.get(['resume']).setValue(null);
          // update user profile to have resume id
          this.uploadService.updateResumeReference(this.resumeId, this.applicant.personal.profile_id).subscribe(resumeResult => {
            if (resumeResult['success']) {
              alert('Resume uploaded');
              this.resumeForm.reset();
            }
          });

        }
        this.isResumeUploading = false;
        this.isUploadDisabled = false;
      });
    }
  }

  onFileChange(event) {
    if (event.length > 0) {
      const reader = new FileReader();
      if (event[0].type.includes('pdf') || event[0].type.includes('msword') ||
        event[0].type.includes('vnd.openxmlformats-officedocument.wordprocessingml.document')) {
        this.errInvalidFile = false;
        // this.resume = event[0];
        reader.onload = () => {
          this.resumeForm.get(['resume']).setValue(event[0]);
        }
        reader.readAsDataURL(event[0]);
      } else {
        this.errInvalidFile = true;
      }
    } else {
      this.resumeForm.get(['resume']).setValue('');
    }
  }

  updateApplicant() {
    this.modalRef = this.modalService.show(CreateApplicantComponent, { 
        class: 'modal-lg', 
        initialState: { applicant: this.applicant } 
    });
    this.modalRef.content.closePopup.subscribe(result => {
        if (result) {
            this.getApplicantById(result['data']._id);
            this.onUpdate.emit(this.applicant);
        }
    });
}

  getApplicantJobStatus(id) {
    this.applicantInfoService.getAllJobHistory(id).subscribe(result => {
      if (result['success']['data']) {
        const status = result['success']['data'];
        this.appliedJobs.forEach(element => {
          const arr = [];
          status.forEach(x => {
            if (x.job_post_id === element.job_post.id) {
              arr.push(x.pipeline);
            }
          });
          element.jobStatus = arr;
        });
      } else {
        console.log('error', result);
      }
    });
  }

  getJobsByApplicantId() {
    if (this.applicant && this.applicant._id) {
      this.applicantInfoService.getJobsByApplicantId(this.applicant._id).subscribe(result => {
          if (result) {
              this.applicant.jobs = result['success']['data'];
          }
      });
    }
  }

  getCommentsByJobId(jobId: any) {
    this.applicantInfoService.getJobAndComments(this.applicant._id, jobId).subscribe(result => {
      if (result) {
        this.comments = result['success']['data'];
      }
    });
  }

  getApplicantById(id: string) {
    this.applicantInfoService.getApplicantById(id).subscribe(result => {
        if (result) {
            this.applicant = result['success']['data'];
            this.applicant.fullName = this.getFullName.bind(this.applicant);
        }
    });
  }
}
