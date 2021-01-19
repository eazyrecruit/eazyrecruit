import { Component, OnInit } from '@angular/core';
import { CompanyService } from '../../../services/company.service';
import { ValidationService } from '../../../services/validation.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { InboundComponent } from './inbound/inbound.component';
import { OutboundComponent } from './outbound/outbound.component';
import { EmailTemplateComponent } from './email-template/email-template.component';
import { ToasterService, ToasterConfig } from 'angular2-toaster';

@Component({
  selector: 'app-emailsettings',
  templateUrl: './emailsettings.component.html',
  providers: [CompanyService, ValidationService]
})
export class EmailsettingsComponent implements OnInit {

  inbound: boolean;
  outbound: boolean;
  company: any;
  htmlPreview: String;
  modalRef: BsModalRef;
  inboundSettings: any;
  outboundSettings: any;
  templateSettings: any;

  constructor(private companyService: CompanyService,
    private modalService: BsModalService,
    private toasterService: ToasterService) {}

  public config: ToasterConfig =  new ToasterConfig({
    showCloseButton: true,
    tapToDismiss: true,
    timeout: 1000,
    animation: 'fade',
    positionClass: 'toast-top-right'
  });

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
      this.templateSettings.forEach(element => {
        if (element.key == 'content') {
          this.htmlPreview = element.value;
        }
      });
    });
  }

  editInbound() {
    if (this.company && this.company._id) {
      this.modalRef = this.modalService.show(InboundComponent, { 
        class: 'modal-md', 
        initialState: { settings: this.inboundSettings, companyId: this.company._id }
      });
      this.modalRef.content.closePopup.subscribe(result => {
          if (result) {
            this.inboundSettings = result;
            this.toasterService.pop('success', 'Settings updated', 'inbound email settings updated successfully');
          }
      });
    }
  }

  editOutbound() {
    if (this.company && this.company._id) {
      this.modalRef = this.modalService.show(OutboundComponent, { 
        class: 'modal-md', 
        initialState: { settings: this.outboundSettings, companyId: this.company._id  }
      });
      this.modalRef.content.closePopup.subscribe(result => {
          if (result) {
            this.outboundSettings = result;
            this.toasterService.pop('success', 'Settings updated', 'outbound email settings updated successfully');
          }
      });
    }
  }

  editTemplate(form) {
    if (this.company && this.company._id) {
      this.modalRef = this.modalService.show(EmailTemplateComponent, { 
        class: 'modal-lg',
        initialState: { settings: this.templateSettings, companyId: this.company._id  }
      });
      this.modalRef.content.closePopup.subscribe(result => {
          if (result) {
            this.templateSettings = result;
            this.templateSettings.forEach(element => {
              if (element.key == 'content') {
                this.htmlPreview = element.value;
              }
            });
            this.toasterService.pop('success', 'Settings updated', 'template email settings updated successfully');
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
        this.templateEdit();
      }
    })
  }

}