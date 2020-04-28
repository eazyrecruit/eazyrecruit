import { Component, OnInit, ViewChild, ElementRef,  } from '@angular/core';
import { FormGroup, FormBuilder, Validators} from '@angular/forms';
import { CompanyService } from '../../../services/company.service';
import { ValidationService } from '../../../services/validation.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { InboundComponent } from './inbound/inbound.component';
import { OutboundComponent } from './outbound/outbound.component';
import { EmailTemplateComponent } from './email-template/email-template.component';

@Component({
  selector: 'app-emailsettings',
  templateUrl: './emailsettings.component.html',
  styleUrls: ['./emailsettings.component.css'],
  providers: [CompanyService, ValidationService]
})
export class EmailsettingsComponent implements OnInit {

  inbound: boolean;
  outbound: boolean;
  company: any;
  modalRef: BsModalRef;
  inboundSettings: any;
  outboundSettings: any;
  templateSettings: any;

  constructor(private companyService: CompanyService,
    private modalService: BsModalService) {}

  ngOnInit() {
    this.setForms();
  }

  inboundEdit() {
    this.companyService.getSettings(this.company._id, 'imap').subscribe(result =>{
      this.inboundSettings = result['success']['data'];
    });
  }

  outboundEdit() {
    this.companyService.getSettings(this.company._id, 'smtp').subscribe(result =>{
      this.outboundSettings = result['success']['data'];
    });
  }

  templateEdit() {
    this.companyService.getSettings(this.company._id, 'template').subscribe(result =>{
      this.templateSettings = result['success']['data'];
    });
  }

  editInbound() {
    this.modalRef = this.modalService.show(InboundComponent, { 
      class: 'modal-md', 
      initialState: { settings: this.inboundSettings }
    });
    this.modalRef.content.closePopup.subscribe(result => {
        if (result) {
          this.inboundSettings = result;
        }
    });
  }

  editOutbound() {
    this.modalRef = this.modalService.show(OutboundComponent, { 
      class: 'modal-md', 
      initialState: { settings: this.outboundSettings }
    });
    this.modalRef.content.closePopup.subscribe(result => {
        if (result) {
          this.outboundSettings = result;
        }
    });
  }

  editTemplate(form) {
    this.modalRef = this.modalService.show(EmailTemplateComponent, { 
      class: 'modal-lg',
      initialState: { settings: this.templateSettings }
    });
    this.modalRef.content.closePopup.subscribe(result => {
        if (result) {
          this.outboundSettings = result;
        }
    });
  }

  setForms() {
    this.companyService.getCompany().subscribe(company => {
      if (company['success']['data']) {
        this.company = company['success']['data'][0];
        this.inboundEdit();
        this.outboundEdit();
        this.templateEdit();
      }
    })
  }

}