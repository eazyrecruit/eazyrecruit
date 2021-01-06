import {Component, OnInit, Input} from '@angular/core';
import {CompanyService} from '../../../../services/company.service';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {ValidationService} from '../../../../services/validation.service';
import {BsModalRef} from 'ngx-bootstrap';
import {Subject} from 'rxjs';
import {ApplicantActivityService} from '../applicant-activity.service';

@Component({
    selector: 'app-add-activity',
    templateUrl: 'add.activity.component.html',
    providers: [ApplicantActivityService, ValidationService]
})
export class AddActivityComponent implements OnInit {

    addActivityForm: FormGroup;
    closePopup: Subject<any>;
    @Input('applicant')
    applicant;
    bsConfig = Object.assign({}, {containerClass: 'theme-red'});

    constructor(private applicantActivityService: ApplicantActivityService,
                private fbForm: FormBuilder,
                private validationService: ValidationService,
                private bsModelRef: BsModalRef) {
        this.addActivityForm = this.fbForm.group({
            title: ['', [<any>Validators.required]],
            description: ['', [<any>Validators.required]],
            applicant: [this.applicant]
        });
    }

    ngOnInit() {
        this.closePopup = new Subject<any>();
        this.addActivityForm.get('applicant').setValue(this.applicant);
    }

    createActivity(form) {
        console.log('Form', form);
        if (!this.addActivityForm.valid) {
            this.validationService.validateAllFormFields(this.addActivityForm);
        } else {
            this.applicantActivityService.createActivity(form).subscribe(result => {
                if (result['success'] && result['success']['data']) {
                    // emit updated data and close model
                    this.closePopup.next(result['success']['data']);
                    this.bsModelRef.hide();
                }
            });
        }
    }

}
