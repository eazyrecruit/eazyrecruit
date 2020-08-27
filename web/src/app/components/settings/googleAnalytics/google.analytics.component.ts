import {Component, OnInit} from '@angular/core';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {CompanyService} from '../../../services/company.service';
import {ValidationService} from '../../../services/validation.service';

@Component({
    selector: 'app-google-analytics',
    templateUrl: './google.analytics.component.html',
    styleUrls: ['./google.analytics.component.css'],
    providers: [CompanyService, ValidationService]
})
export class GoogleAnalyticsComponent implements OnInit {

    analyticsForm: FormGroup;
    company: any;
    isTrackingIdEmpty: any = false;

    constructor(private companyService: CompanyService,
                private validationService: ValidationService,
                private fbForm: FormBuilder) {
        this.analyticsForm = this.fbForm.group({
            analytics: [true],
            trackingID: [null]
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
                                this.analyticsForm.get(setting.key).setValue(setting.value);
                            });
                        }

                    });
            } else {
                this.analyticsForm.reset();
            }
        });
    }

    editForm(form) {
        console.log('form', form);
        if (form.analytics) {
            if (!form.trackingID) {
                this.isTrackingIdEmpty = true;
                return;
            }
        }
        this.companyService.editSettings(form, this.company._id, 'googleAnalytics').subscribe(result => {
            if (result['success']) {
                this.setForm();
            }
        });
    }

}
