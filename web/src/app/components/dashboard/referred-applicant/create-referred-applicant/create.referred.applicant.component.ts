import {Component, OnInit, Input, OnChanges, Output, EventEmitter} from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {ValidationService} from '../../../../services/validation.service';
import {SkillsService} from '../../../../services/skills.service';
import {DataShareService} from '../../../../services/data-share.service';
import {LocationService} from '../../../../services/location.service';
import {ToasterModule, ToasterService, ToasterConfig} from 'angular2-toaster';
import {SearchService} from '../../../../services/search.service';
import {Observable, Subject} from 'rxjs';
import {map} from 'rxjs/operators';
import {BsModalRef} from 'ngx-bootstrap';
import {ApplicantService} from '../../../../services/applicant.service';
import {AccountService} from '../../../../services/account.service';

@Component({
    selector: 'app-create-referred-applicant',
    templateUrl: 'create.referred.applicant.component.html',
    providers: [ValidationService, SkillsService, SearchService, LocationService, ApplicantService]
})
export class CreateReferredApplicantComponent implements OnInit {

    @Input()
    jobId: any;

    closePopup: Subject<any>;
    applicantForm: FormGroup;
    resume: any;
    errInvalidFile = '';

    constructor(
        private bsModelRef: BsModalRef,
        private accountService: AccountService,
        private fbForm: FormBuilder,
        private validationService: ValidationService,
        private skillService: SkillsService,
        private applicantService: ApplicantService) {
        this.populate();
    }

    ngOnInit() {
        this.closePopup = new Subject<any>();
        this.populate();
    }

    populate() {
        this.applicantForm = this.fbForm.group({
            firstName: [null],
            middleName: [null, []],
            lastName: [null, []],
            email: [null, ''],
            phone: [null, []],
            availability: [null],
            noticePeriod: [null],
            noticePeriodNegotiable: [null],
            resume: [null],
            dob: [null],
            source: ['upload']

        });

    }

    onFileChange(event) {
        const reader = new FileReader();
        this.errInvalidFile = '';
        if (event && event.length) {
            if (event[0].type.includes('pdf') || event[0].type.includes('msword') ||
                event[0].type.includes('vnd.openxmlformats-officedocument.wordprocessingml.document')) {
                reader.onload = () => {
                    this.resume = event[0];
                    // this.applicantForm.get(['resume']).setValue(event[0]);
                };
                reader.readAsDataURL(event[0]);
            } else {
                this.applicantForm.get(['resume']).setValue('');
                this.resume = null;
                this.errInvalidFile = 'Please upload only pdf/doc/docx file';
            }
        } else {
            this.errInvalidFile = 'Resume is required';
            this.applicantForm.get(['resume']).setValue('');
            this.resume = null;
        }
    }


    createApplicant(applicantForm) {
        if (!this.resume) {
            this.errInvalidFile = 'Resume is required';
            return;
        }

        const formData = new FormData();
        for (const key in applicantForm) {
            if (applicantForm[key] !== null) {
                formData.append(key, applicantForm[key]);
            }
        }
        formData.set('resume', this.resume);
        if (this.jobId) {
            formData.append('jobId', this.jobId);
        }

        this.applicantService.resume(formData).subscribe(result => {
            if (result && result['success']) {
                this.closePopup.next(result['success']);
                this.bsModelRef.hide();
            }
        });
    }

    validateAvailability(event: any) {
        if (!(parseInt(event.target.value) >= 0)) {
            console.log('add error message here!');
        }
    }
}
