import {Component, OnInit, OnDestroy, Input} from '@angular/core';
import {CompanyService} from '../../../../../services/company.service';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {ValidationService} from '../../../../../services/validation.service';
import {BsModalRef} from 'ngx-bootstrap';
import {Subject, Subscription} from 'rxjs';

@Component({
    selector: 'app-inbound',
    templateUrl: './inbound.component.html',
    providers: [CompanyService, ValidationService]
})
export class InboundComponent implements OnInit, OnDestroy {
    private _subs: Subscription;
    inboundForm: FormGroup;
    closePopup: Subject<any>;

    @Input('settings')
    settings;

    @Input('companyId')
    companyId;

    constructor(private companyService: CompanyService,
                private fbForm: FormBuilder,
                private validationService: ValidationService,
                private bsModelRef: BsModalRef) {
        this.inboundForm = this.fbForm.group({
            type: ["imap", [<any>Validators.required]],
            host: [null, [<any>Validators.required]],
            user: [null, [<any>Validators.required]],
            password: [null, [<any>Validators.required]],
            ssl: [null],
            port: [null],
            folder: [null],
            messages: [null]
        });
    }

    ngOnInit() {
        this.closePopup = new Subject<any>();
        this.inboundEdit();
    }

    inboundEdit() {
        if (this.settings) {
            this.settings.forEach(setting => {
                this.inboundForm.get(setting.key).setValue(setting.value);
            });
        }
    }

    editInbound(form) {
        if (!this.inboundForm.valid) {
            this.validationService.validateAllFormFields(this.inboundForm);
        } else {
             this._subs = this.companyService.editSettings(form, this.companyId, form.type).subscribe(result => {
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
