import { Component, OnInit, Input } from '@angular/core';
import { CompanyService } from '../../../../services/company.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ValidationService } from '../../../../services/validation.service';
import { BsModalRef } from 'ngx-bootstrap';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-outbound',
  templateUrl: './outbound.component.html',
  styleUrls: ['./outbound.component.css'],
  providers: [CompanyService, ValidationService]
})
export class OutboundComponent implements OnInit {

  outboundForm: FormGroup;
  closePopup: Subject<any>;

  @Input('settings')
  settings;

  constructor(private companyService: CompanyService,
    private fbForm: FormBuilder,
    private validationService: ValidationService,
    private bsModelRef: BsModalRef) {
      this.outboundForm = this.fbForm.group({
        mailvia: ["smtp", [<any>Validators.required]],
        host: [null, [<any>Validators.required]],
        user: [null],
        password: [null],
        port: [null],
        fromEmail: [null, [<any>Validators.required]],
        fromDisplayname: [null]
      });
    }

  ngOnInit() {
    this.closePopup = new Subject<any>();
    this.outboundEdit();
  }

  outboundEdit() {
    if (this.settings) {
      this.settings.forEach(setting => {
        this.outboundForm.get(setting.key).setValue(setting.value);
      });
    }
  }

  editOutbound(form) {
    if (!this.outboundForm.valid) {
      this.validationService.validateAllFormFields(this.outboundForm);
    } else {
      this.companyService.editSettings(form, this.settings.company._id, form.mailvia).subscribe(result => {
        if (result['success']) {
          this.outboundEdit();
        }
      });
    }
  }


}
