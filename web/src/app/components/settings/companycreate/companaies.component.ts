import { Component, OnInit,Output, EventEmitter, Input, OnChanges, DoCheck } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CompanyService } from '../../../services/company.service';
import { ValidationService } from '../../../services/validation.service';
import { SharedService } from '../../../services/shared.service';
import { element } from 'protractor';
import { concatAll } from 'rxjs/operators';
@Component({
  selector: 'add-company',
  templateUrl: './companaies.component.html',
  styleUrls: ['./companaies.component.css'],
  providers: [CompanyService, ValidationService, SharedService]
})
export class CompanaiesComponent implements OnInit, OnChanges {

  errInvalidFile: boolean;
  companyDetails: FormGroup;
  company = {
    id: Number,
    company_email: String,
    company_name: String,
    company_phone: String,
    created_by: Number,
    head_office_address: String,
    is_deleted: Boolean,
    modified_by: String
  };

  @Input()
  data: any = null;

  @Output()
  refreshList: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private companyService: CompanyService,
    private router: Router,
    private fbForm: FormBuilder,
    private validationService: ValidationService,
    private sharedService: SharedService
  ) {
    this.companyDetails = this.fbForm.group({
      companyName: [null, [<any>Validators.required], this.validationService.nameValid],
      address: [null, [<any>Validators.required], this.validationService.nameValid],
      email: [null, [<any>Validators.required], this.validationService.emailValid],
      phoneNo: [null, [<any>Validators.required], this.validationService.mobileValid]
    });
  }

  ngOnChanges(): void {
    this.populate(this.data);
  }

  ngOnInit() {
    this.populate(null);
  }

  populate(company) {
    if (company) {
      this.companyDetails = this.fbForm.group({
        companyName: [company.company_name, [<any>Validators.required], this.validationService.nameValid],
        address: [company.head_office_address, [<any>Validators.required], this.validationService.nameValid],
        email: [company.company_email, [<any>Validators.required], this.validationService.emailValid],
        phoneNo: [company.company_phone, [<any>Validators.required], this.validationService.mobileValid]
      });
    } else {
      this.companyDetails = this.fbForm.group({
        companyName: [null, [<any>Validators.required], this.validationService.nameValid],
        address: [null, [<any>Validators.required], this.validationService.nameValid],
        email: [null, [<any>Validators.required], this.validationService.emailValid],
        phoneNo: [null, [<any>Validators.required], this.validationService.mobileValid]
      });

    }
  }


  create(companyForm: any) {
    if (!this.companyDetails.valid) {
      this.validationService.validateAllFormFields(this.companyDetails);
    }

    this.companyService.createCompany(companyForm).subscribe(result => {
      if (result['success']) {
        this.companyDetails.reset();
        this.refreshList.emit(true);
        this.router.navigate(['settings/companies']);
      }
    });
  }

  edit(companyForm) {
    if (!this.companyDetails.valid) {
      this.validationService.validateAllFormFields(this.companyDetails);
    }
    this.companyService.editCompany(companyForm).subscribe(result => {
      if (result['success']) {
        this.companyDetails.reset();
        this.refreshList.emit(true);
        this.router.navigate(['settings/companies']);
      }
    });

  }

  companyDetail(companyForm: any) {
    if (this.data) {
      companyForm.id = this.data.id;
      this.edit(companyForm);
    } else {
      this.create(companyForm);
    }
  }

}
