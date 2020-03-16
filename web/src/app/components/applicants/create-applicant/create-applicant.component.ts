import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ValidationService } from '../../../services/validation.service';
import { SkillsService } from '../../../services/skills.service';
import { DataShareService } from '../../../services/data-share.service';
import { LocationService } from '../../../services/location.service';
import { ToasterModule, ToasterService, ToasterConfig } from 'angular2-toaster';
import { SearchService } from '../../../services/search.service';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { BsModalRef } from 'ngx-bootstrap';
import { ApplicantService } from '../../../services/applicant.service';
import { AccountService } from '../../../services/account.service';

@Component({
  selector: 'app-create-applicant',
  templateUrl: './create-applicant.component.html',
  styleUrls: ['./create-applicant.component.css'],
  providers: [ValidationService, SkillsService, SearchService, LocationService, ApplicantService]
})
export class CreateApplicantComponent implements OnInit {

  @Input()
  jobId: any;

  @Input()
  pipelineId: any;

  closePopup: Subject<any>;
  applicantForm: FormGroup;
  referrers: any;

  constructor(
    private bsModelRef: BsModalRef,
    private accountService: AccountService,
    private fbForm: FormBuilder,
    private validationService: ValidationService,
    private skillService: SkillsService,
    private applicantService: ApplicantService,
    private dataShared: DataShareService,
    private locationService: LocationService) {
    this.populate(null);
  }

  ngOnChanges(): void {
  }

  ngOnInit() {
    this.getAllUsers();
    this.closePopup = new Subject<any>();
  }

  public asyncSkills = (text: string): Observable<any> => {
    return this.skillService.getSkills(text).pipe(map((data: any) => data.success.data));
  };

  public asyncLocations = (text: string): Observable<any> => {
    return this.locationService.getLocations(text).pipe(map((data: any) => data.success.data));
  };

  populate(applicant) {
    this.applicantForm = this.fbForm.group({
      resume: [null],
      dob: [null],
      source: [null],
      firstName: [null, [<any>Validators.required], this.validationService.nameValid],
      middleName: [null, [], this.validationService.nameValid],
      lastName: [null, [], this.validationService.nameValid],
      email: [null, [<any>Validators.required], this.validationService.emailValid],
      phone: [null, [], this.validationService.mobileValid],
      referredBy: [null],
      noticePeriod: [null],
      noticePeriodNegotiable: [null],
      skills: [null, []],
      experience: [null, [], this.validationService.experienceValid],
      currentCtc: [null, [], this.validationService.ctcValid],
      expectedCtc: [null, [], this.validationService.ctcValid],
      availability: [null],
      currentLocation: [null, []],
      preferredLocation: [null, []]
    });

  }

  getAllUsers() {
    this.accountService.getAllUsers({ offset: 0, pageSize: 10, searchText: '' }).subscribe(result => {
      if (result['success']['data'].length) {
        this.referrers = result['success']['data'];
        // this.interviewForm.get('interviewerId').setValue(this.event.extendedProps.interviewer);
      }
    });
  }

  onFileChange(event) {
    const reader = new FileReader();
    if (event && event.length) {
      if (event[0].type.includes('pdf') || event[0].type.includes('msword') ||
        event[0].type.includes('vnd.openxmlformats-officedocument.wordprocessingml.document')) {
        reader.onload = () => {
          this.applicantForm.get(['resume']).setValue(event[0]);
        }
        reader.readAsDataURL(event[0]);
      } else {
        this.applicantForm.get(['resume']).setValue('');
      }
    } else {
      this.applicantForm.get(['resume']).setValue('');
    }
  }


  createApplicant(applicantForm) {
    if (!this.applicantForm.valid) {
      this.validationService.validateAllFormFields(this.applicantForm);
    } else {
      const formData = new FormData();
      for ( var key in applicantForm) {
        if (applicantForm[key] !== null) {
          formData.append(key, applicantForm[key]);
        }
      }
      let skill = [];
      let current = [];
      let preferred = [];
      if (applicantForm.skills) {
        for (let index = 0; index < applicantForm.skills.length; index++) {
          if (applicantForm.skills[index]._id) {
            skill.push({ id: applicantForm.skills[index]._id, name: applicantForm.skills[index].name });
          } else {
            skill.push({ name: applicantForm.skills[index].value });
          }
        }
        formData.set('skills', JSON.stringify(skill));
      }

      if (applicantForm.currentLocation) {
        for (let index = 0; index < applicantForm.currentLocation.length; index++) {
          if (applicantForm.currentLocation[index]._id) {
            current.push({ 
              id: applicantForm.currentLocation[index]._id, 
              country: applicantForm.currentLocation[index].country, 
              state: applicantForm.currentLocation[index].state, 
              city: applicantForm.currentLocation[index].city, 
              zip: applicantForm.currentLocation[index].zip });
          } else {
            current.push({ 
              id: applicantForm.currentLocation[index]._id, 
              country: applicantForm.currentLocation[index].country, 
              state: applicantForm.currentLocation[index].state, 
              city: applicantForm.currentLocation[index].city, 
              zip: applicantForm.currentLocation[index].zip });
          }
        }
        formData.set('currentLocation', JSON.stringify(current));
      }

      if (applicantForm.preferredLocation) {
        for (let index = 0; index < applicantForm.preferredLocation.length; index++) {
          preferred.push({ 
            id: applicantForm.preferredLocation[index]._id, 
            country: applicantForm.preferredLocation[index].country, 
            state: applicantForm.preferredLocation[index].state, 
            city: applicantForm.preferredLocation[index].city, 
            zip: applicantForm.preferredLocation[index].zip });
        }
        formData.set('preferredLocation', JSON.stringify(preferred));
      }

      if (this.pipelineId) {
        formData.append('pipelineId', this.pipelineId);
      }
      if (this.jobId) {
        formData.append('jobId', this.jobId);
      }
      
      this.applicantService.save(formData).subscribe(result => {
        if (result && result['success']) {
          this.closePopup.next(result['success']);
          this.bsModelRef.hide();
        }
      });
    }
  }
}
