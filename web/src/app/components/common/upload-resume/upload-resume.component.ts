import {Component, OnInit, OnDestroy} from '@angular/core';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';

import {ApplicantService} from '../../../services/applicant.service';
import {ValidationService} from '../../../services/validation.service';
import {SkillsService} from '../../../services/skills.service';
import {BsModalRef} from 'ngx-bootstrap';
import {Subject} from 'rxjs/internal/Subject';
import {Subscription} from "rxjs";

// import { Observable } from 'rxjs/Observable';

@Component({
    selector: 'app-upload-resume',
    templateUrl: './upload-resume.component.html',
    providers: [ApplicantService, ValidationService, SkillsService]
})
export class UploadResumeComponent implements OnInit, OnDestroy {
    errInvalidFile: boolean;
    formDetails: FormGroup;
    resume: any;
    items = [];
    skills = [];
    skillsAdded = [];

    public onClose: Subject<any>;

    private _subs: Subscription;

    constructor(
        private modalRef: BsModalRef,
        private applicantService: ApplicantService,
        private fbForm: FormBuilder,
        private validationService: ValidationService,
    ) {
        this.formDetails = this.fbForm.group({
            resume: [null, [<any>Validators.required]]
        });
    }

    ngOnInit() {
        this.onClose = new Subject<any>();
    }

    details(resumeForm: any) {
        if (!this.formDetails.valid) {
            this.validationService.validateAllFormFields(this.formDetails);
        }
        if (this.formDetails.valid) {
            const technologies = [];
            this.items.forEach(element => {
                technologies.push(element.value);
            });
            const formData = new FormData();
            formData.append('resume', this.resume);
            formData.append('source', 'upload');
            this._subs = this.applicantService.resume(formData).subscribe(result => {
                if (result && result['success']) {
                    this.onClose.next(result['success']['data']);
                    this.modalRef.hide();
                }
            }, (error) => {
                this.onClose.next();
                this.modalRef.hide();
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
            this.formDetails.get(['resume']).setValue(event[0].name);
        } else {
            this.formDetails.get(['resume']).setValue(null);
        }
    }

    ngOnDestroy(): void {
        if (this._subs) {
            this._subs.unsubscribe();
        }
    }
}
