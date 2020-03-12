import { Component, OnInit, Input, OnChanges, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { ApplicantDataService } from '../../../services/applicant-data.service';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UploadService } from '../../../services/upload.service';
import { ApplicantInfoService } from '../applicantInfo/applicant-info.service';
import { ValidationService } from '../../../services/validation.service';
import { SearchService } from '../../../services/search.service';
import { saveAs } from 'file-saver';


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


  constructor(
    private applicantDataService: ApplicantDataService,
    private activatedRoute: ActivatedRoute,
    private uploadService: UploadService,
    private fb: FormBuilder,
    private validationService: ValidationService,
    private applicantInfoService: ApplicantInfoService
  ) {
    this.resumeForm = this.fb.group({
      resume: [null, [<any>Validators.required]]
    });
  }

  ngOnInit() {
    this.getApplicantData(this.activatedRoute.snapshot.data['applicant'].success.data);
  }

  ngOnDestroy() {
    this.applicantId = null;
  }

  getApplicantData(applicant: any) {
    if (applicant) {
      if (applicant.personal.first_name) {
        this.fullName = this.setFullName(
          applicant.personal.first_name ? applicant.personal.first_name : '',
          applicant.personal.middle_name ? applicant.personal.middle_name : '',
          applicant.personal.last_name ? applicant.personal.last_name : ''
        );
      } else {
        this.fullName = 'Not Available';
      }
        this.applicant = applicant;
        this.applicant._id = applicant.personal.profile_id;
        this.personalInfo = applicant.personal;
        this.addressesInfo = applicant.addresses ? applicant.addresses : [];
        this.experiencesInfo = applicant.experiences ? applicant.experiences : [];
        this.skills = applicant.skills ? applicant.skills.skill : [];
        this.appliedJobs = applicant.appliedJobs ? applicant.appliedJobs : [],
        this.applicant.resume = applicant.resume_id;
        // this.applicantComments = applicant.comments ? applicant.comments : [];
        this.getApplicantJobStatus(this.applicant._id);
    } else {
      console.log('Error in fetching applicant!');
    }
  }

  setFullName(first, middle, last) {
    if (middle) {
      return first + ' ' + middle + ' ' + last;
    } else {
      return first + ' ' + last;
    }
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
      if (event[0].type.includes('pdf') || event[0].type.includes('msword') ||
        event[0].type.includes('vnd.openxmlformats-officedocument.wordprocessingml.document')) {
        this.errInvalidFile = false;
        this.resume = event[0];
      } else {
        this.errInvalidFile = true;
      }
      this.resumeForm.get(['resume']).setValue(event[0].name);

    } else {
      this.resumeForm.get(['resume']).setValue(null);
    }
  }

  editApplicant(applicant, template: TemplateRef<any>) {
    window.editApplicantPopup = document.getElementById('closeButton');
    this.applicantDetails = applicant;
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

}
