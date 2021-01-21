import {Component, OnInit} from '@angular/core';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {CompanyService} from '../../../../services/company.service';
import {ValidationService} from '../../../../services/validation.service';

@Component({
    selector: 'app-google-analytics',
    templateUrl: './google.analytics.component.html',
    providers: [CompanyService, ValidationService]
})
export class GoogleAnalyticsComponent implements OnInit {

    analyticsForm: FormGroup;
    company: any;
    isTrackingIdEmpty: any = false;
    json: any;

    constructor(private companyService: CompanyService,
                private validationService: ValidationService,
                private fbForm: FormBuilder) {
        this.analyticsForm = this.fbForm.group({
            analytics: [true],
            trackingID: [null],
            clientEmail: [null],
            privateKey: [null],
            viewId: [null],
            json: []
        });
    }

    ngOnInit() {
        this.setForm();
    }

    setForm() {
        this.companyService.getCompany().subscribe(company => {
            if (company['success']['data']) {
                this.company = company['success']['data'][0];
                this.companyService.getSettings(this.company._id, 'googleAnalytics').subscribe(
                    result => {
                        if (result['success']['data']) {
                            result['success']['data'].forEach(setting => {
                                // tslint:disable-next-line:triple-equals max-line-length
                                const value = setting.value == 'true' || setting.value == true ? true : setting.value == 'false' || setting.value == false ? false : setting.value;
                                this.analyticsForm.get(setting.key).setValue(value);
                            });
                        }

                    });
            } else {
                this.analyticsForm.reset();
            }
        });
    }

    onFileChange(event) {
        const reader = new FileReader();
        if (event[0].type.includes('json')) {
            reader.onload = () => {
                this.json = event[0];
            };
            reader.readAsDataURL(event[0]);
        }
    }

    editForm(form) {
        const formData = new FormData();
        formData.append('analytics', form.analytics);
        if (form.analytics) {
            if (!form.trackingID || !form.viewId) {
                this.isTrackingIdEmpty = true;
                return;
            }
            if (this.json) {
                formData.append('gaConfigurationFile', this.json);
            }
            formData.append('trackingID', form.trackingID);
            formData.append('viewId', form.viewId);

        }
        this.companyService.editSettings(formData, this.company._id, 'googleAnalytics').subscribe(result => {
            if (result['success']) {
                this.setForm();
            }
        });
    }

}
