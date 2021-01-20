import {Component, OnInit} from '@angular/core';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {CompanyService} from '../../../services/company.service';
import {ValidationService} from '../../../services/validation.service';

@Component({
    selector: 'app-interview-integration',
    templateUrl: 'interview.integration.component.html',
    providers: [CompanyService, ValidationService]
})
export class InterviewIntegrationComponent implements OnInit {

    interviewIntegrationForm: FormGroup;
    company: any;
    isTrackingIdEmpty: any = false;
    json: any;

    constructor(private companyService: CompanyService,
                private validationService: ValidationService,
                private fbForm: FormBuilder) {
        this.interviewIntegrationForm = this.fbForm.group({
            goLiveMeet: [true],
            goLiveMeetClientID: [null],
            goLiveMeetClientSecret: [null]
        });
    }

    ngOnInit() {
        this.setForm();
    }

    setForm() {
        this.companyService.getCompany().subscribe(company => {
            if (company['success']['data']) {
                this.company = company['success']['data'][0];
                this.companyService.getSettings(this.company._id, 'interviewIntegration').subscribe(
                    result => {
                        if (result['success']['data']) {
                            result['success']['data'].forEach(setting => {
                                // tslint:disable-next-line:triple-equals max-line-length
                                const value = setting.value == 'true' || setting.value == true ? true : setting.value == 'false' || setting.value == false ? false : setting.value;
                                this.interviewIntegrationForm.get(setting.key).setValue(value);
                            });
                        }

                    });
            } else {
                this.interviewIntegrationForm.reset();
            }
        });
    }

    editForm(form) {
        if (form.goLiveMeet) {
            if (!form.goLiveMeetClientID || !form.goLiveMeetClientSecret) {
                this.isTrackingIdEmpty = true;
                return;
            }
        }
        this.companyService.editSettings({
            goLiveMeet: form.goLiveMeet,
            goLiveMeetClientID: form.goLiveMeetClientID,
            goLiveMeetClientSecret: form.goLiveMeetClientSecret
        }, this.company._id, 'interviewIntegration').subscribe(result => {
            if (result['success']) {
                this.setForm();
            }
        });
    }

}
