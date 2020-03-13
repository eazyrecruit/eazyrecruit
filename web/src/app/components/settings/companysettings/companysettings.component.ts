import { Component, OnInit,  } from '@angular/core';
import { FormGroup, FormBuilder, Validators} from '@angular/forms';
import { CompanyService } from '../../../services/company.service';
import { ValidationService } from '../../../services/validation.service';

@Component({
  selector: 'app-companysettings',
  templateUrl: './companysettings.component.html',
  styleUrls: ['./companysettings.component.css'],
  providers: [CompanyService, ValidationService]
})
export class CompanysettingsComponent implements OnInit {

  companyDetails: FormGroup;
  company: any;
  isSearchResultAvail: any = 0;
  

  constructor(private companyService: CompanyService, 
    private validationService: ValidationService,
    private fbForm: FormBuilder)
    {
      this.companyDetails = this.fbForm.group({
        name: [null, [<any>Validators.required], this.validationService.nameValid],
        website: [null, <any>Validators.required],
        address_line_1: [null, [<any>Validators.required], this.validationService.nameValid],
        address_line_2: [null],
        address_line_3: [null],
        email: [null, [<any>Validators.required], this.validationService.emailValid],
        phone: [null, [<any>Validators.required], this.validationService.mobileValid]
      });
    }

  ngOnInit() {
    this.getDetails();
  }

  getDetails() {
    this.companyService.getCompany().subscribe(result => {
      if (result['success']['data']) {
        this.company = result['success']['data'][0];
        this.companyDetails.setValue({
          name: result['success']['data'][0].name,
          website: result['success']['data'][0].website,
          address_line_1: result['success']['data'][0].address_line_1,
          address_line_2: result['success']['data'][0].address_line_2 || '',
          address_line_3: result['success']['data'][0].address_line_3 || '',
          email: result['success']['data'][0].email,
          phone: result['success']['data'][0].phone
        })
        this.isSearchResultAvail = 1;
      } else {
        this.isSearchResultAvail = 2;
      }
    })
  }


  edit(companyForm) {
    if (!this.companyDetails.valid) {
      this.validationService.validateAllFormFields(this.companyDetails);
    }
    companyForm.id = this.company._id;
    this.companyService.editCompany(companyForm).subscribe(result => {
      if (result['success']) {
        this.getDetails();
      }
    });
  }
}