import {Component, OnInit, OnDestroy, Input} from '@angular/core';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {ValidationService} from '../../../../services/validation.service';
import {Subject, Subscription} from 'rxjs';
import {BsModalRef} from 'ngx-bootstrap';
import {ApplicantService} from '../../../../services/applicant.service';
import {ToasterService} from 'angular2-toaster';

@Component({
    selector: 'app-create-referred-applicant',
    templateUrl: 'create.referred.applicant.component.html',
    providers: [ValidationService, ApplicantService]
})
export class CreateReferredApplicantComponent implements OnInit, OnDestroy {

    @Input()
    jobId: any;

    closePopup: Subject<any>;
    applicantForm: FormGroup;
    resume: any;
    errInvalidFile = '';
    private _subs: Subscription;

    constructor(
        private bsModelRef: BsModalRef,
        private fbForm: FormBuilder,
        private validationService: ValidationService,
        private toasterService: ToasterService,
        private applicantService: ApplicantService) {
        this.populate();
    }

    ngOnInit() {
        this.closePopup = new Subject<any>();
        this.populate();
    }

    populate() {
        this.applicantForm = this.fbForm.group({
            firstName: [null, [<any>Validators.required], this.validationService.nameValid],
            middleName: [null, [], this.validationService.nameValid],
            lastName: [null, [], this.validationService.nameValid],
            email: [null, [<any>Validators.required], this.validationService.emailValid],
            phone: [null],
            availability: [null],
            resume: [null],
            noticePeriod: [null],
            noticePeriodNegotiable: [null],
            comment: [null],
            source: ['upload'],
            experience: [null],
            currentCtc: [null],
            expectedCtc: [null]
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
        if (!this.applicantForm.valid) {
            this.validationService.validateAllFormFields(this.applicantForm);
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

        this._subs = this.applicantService.uploadReferred(formData).subscribe(result => {
            if (result && result['success']) {
                this.closePopup.next(result['success']);
            } else if (result && result['error']) {
                this.toasterService.pop('error', 'Referer Applicant', result['error'].message);
            }
            this.bsModelRef.hide();
        }, (error) => {
            this.bsModelRef.hide();
            console.log('errrr', error);
        });
    }

    validateAvailability(event: any) {
        if (!(parseInt(event.target.value) >= 0)) {
            console.log('add error message here!');
        }
    }

    ngOnDestroy(): void {
        if (this._subs) {
            this._subs.unsubscribe();
        }
    }
}
