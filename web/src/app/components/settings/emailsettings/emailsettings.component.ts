import { Component, OnInit,  } from '@angular/core';
import { FormGroup, FormBuilder, Validators} from '@angular/forms';
import { CompanyService } from '../../../services/company.service';
import { ValidationService } from '../../../services/validation.service';

@Component({
  selector: 'app-emailsettings',
  templateUrl: './emailsettings.component.html',
  styleUrls: ['./emailsettings.component.css'],
  providers: [CompanyService, ValidationService]
})
export class EmailsettingsComponent implements OnInit {

  inbound: boolean;
  outbound: boolean;
  inboundForm: FormGroup;
  outboundForm: FormGroup;
  company: any;

  constructor(private companyService: CompanyService,
    private validationService: ValidationService,
    private fbForm: FormBuilder) 
    { 
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
      this.outboundForm = this.fbForm.group({
        mailvia: ["smtp", [<any>Validators.required]],
        host: [null, [<any>Validators.required]],
        user: [null],
        password: [null],
        port: [null]
      });
    }

  ngOnInit() {
    this.setForms();
  }

  inboundEdit() {
        this.companyService.getSettings(this.company._id, this.inboundForm.controls.type.value).subscribe(result =>{
          var settings = result['success']['data'];
          settings.forEach(setting => {
            this.inboundForm.get(setting.key).setValue(setting.value);
          });
        })
  }

  outboundEdit() {
        this.companyService.getSettings(this.company._id, this.outboundForm.controls.mailvia.value).subscribe(result =>{
          var settings = result['success']['data'];
          settings.forEach(setting => {
            this.outboundForm.get(setting.key).setValue(setting.value);
          });
        })
  }

  editInbound(form) {
    if (!this.inboundForm.valid) {
      this.validationService.validateAllFormFields(this.inboundForm);
    } else {
      this.companyService.editSettings(form, this.company._id, form.type).subscribe(result => {
        if (result['success']) {
          this.inboundEdit();
        }
      });
    }
  }

  editOutbound(form) {
    if (!this.outboundForm.valid) {
      this.validationService.validateAllFormFields(this.outboundForm);
    } else {
      this.companyService.editSettings(form, this.company._id, form.mailvia).subscribe(result => {
        if (result['success']) {
          this.outboundEdit();
        }
      });
    }
  }

  setForms() {
    this.companyService.getCompany().subscribe(company => {
      if (company['success']['data']) {
        this.company = company['success']['data'][0];
        this.inboundEdit();
        this.outboundEdit();
      } else {
        this.inboundForm.reset();
        this.outboundForm.reset();
      }
    })
  }

}