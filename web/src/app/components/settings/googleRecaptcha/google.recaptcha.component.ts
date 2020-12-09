import {Component, OnInit} from '@angular/core';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {CompanyService} from '../../../services/company.service';
import {ValidationService} from '../../../services/validation.service';

@Component({
    selector: 'app-google-recaptcha',
    templateUrl: './google.recaptcha.component.html',
    styleUrls: ['./google.recaptcha.component.css'],
    providers: [CompanyService, ValidationService]
})
export class GoogleRecaptchaComponent implements OnInit {

    recaptchaForm: FormGroup;
    company: any;
    isTrackingIdEmpty: any = false;
    json: any;

    constructor(private companyService: CompanyService,
                private validationService: ValidationService,
                private fbForm: FormBuilder) {
        this.recaptchaForm = this.fbForm.group({
            recaptcha: [true],
            secretKey: [null],
            siteKey: [null]
        });
    }

    ngOnInit() {
        this.setForm();
    }

    setForm() {
        this.companyService.getCompany().subscribe(company => {
            if (company['success']['data']) {
                this.company = company['success']['data'][0];
                this.companyService.getSettings(this.company._id, 'googleRecaptcha').subscribe(
                    result => {
                        if (result['success']['data']) {
                            result['success']['data'].forEach(setting => {
                                // tslint:disable-next-line:triple-equals max-line-length
                                const value = setting.value == 'true' || setting.value == true ? true : setting.value == 'false' || setting.value == false ? false : setting.value;
                                this.recaptchaForm.get(setting.key).setValue(value);
                            });
                        }

                    });
            } else {
                this.recaptchaForm.reset();
            }
        });
    }

    editForm(form) {
        if (form.recaptcha) {
            if (!form.secretKey || !form.siteKey) {
                this.isTrackingIdEmpty = true;
                return;
            }
        }
        this.companyService.editSettings({
            recaptcha: form.recaptcha,
            secretKey: form.secretKey,
            siteKey: form.siteKey
        }, this.company._id, 'googleRecaptcha').subscribe(result => {
            if (result['success']) {
                this.setForm();
            }
        });
    }

}
