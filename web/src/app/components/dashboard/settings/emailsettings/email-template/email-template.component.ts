import {Component, OnInit, OnDestroy, Input} from '@angular/core';
import {CompanyService} from '../../../../../services/company.service';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {ValidationService} from '../../../../../services/validation.service';
import {BsModalRef} from 'ngx-bootstrap';
import {Subject, Subscription} from 'rxjs';

@Component({
    selector: 'app-email-template',
    templateUrl: './email-template.component.html',
    providers: [CompanyService, ValidationService]
})
export class EmailTemplateComponent implements OnInit, OnDestroy {
    private _subs: Subscription;

    templateForm: FormGroup;
    closePopup: Subject<any>;
    htmlPreview: String;

    @Input('settings')
    settings;

    @Input('companyId')
    companyId;

    constructor(private companyService: CompanyService,
                private fbForm: FormBuilder,
                private validationService: ValidationService,
                private bsModelRef: BsModalRef) {
        this.templateForm = this.fbForm.group({
            content: [null, [<any>Validators.required]],
        });
    }

    ngOnInit() {
        this.closePopup = new Subject<any>();
        this.templateEdit();
    }

    templateEdit() {
        if (this.settings) {
            this.settings.forEach(setting => {
                this.htmlPreview = setting.value;
                this.templateForm.get(setting.key).setValue(setting.value);
            });
        }
    }

    editTemplate(form) {
        if (!this.templateForm.valid) {
            this.validationService.validateAllFormFields(this.templateForm);
        } else {
             this._subs = this.companyService.editSettings(form, this.companyId, 'template').subscribe(result => {
                if (result['success'] && result['success']['data']) {
                    // emit updated data and close model
                    this.closePopup.next(result['success']['data']);
                    this.bsModelRef.hide();
                }
            });
        }
    }

    ngOnDestroy(): void {
        if (this._subs) {
            this._subs.unsubscribe();
        }
    }
}
