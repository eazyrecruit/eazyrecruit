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
  logo: any;
  headerBgColor: any;
  headerTextColor: any;
  currentLogo: any;
  

  constructor(private companyService: CompanyService, 
    private validationService: ValidationService,
    private fbForm: FormBuilder)
    {
      this.companyDetails = this.fbForm.group({
        logo: [null],
        headerDescription: [null],
        headerBgColor: [''],
        headerTextColor: [''],
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
          logo: [null],
          headerDescription: result['success']['data'][0].header_description || '',
          headerBgColor: result['success']['data'][0].header_bg_color || '',
          headerTextColor: result['success']['data'][0].header_text_color || '',
          name: result['success']['data'][0].name,
          website: result['success']['data'][0].website,
          address_line_1: result['success']['data'][0].address_line_1,
          address_line_2: result['success']['data'][0].address_line_2 || '',
          address_line_3: result['success']['data'][0].address_line_3 || '',
          email: result['success']['data'][0].email,
          phone: result['success']['data'][0].phone
        })
        this.headerBgColor = result['success']['data'][0].header_bg_color;
        this.headerTextColor = result['success']['data'][0].header_text_color;
        this.logo = result['success']['data'][0].logo;
        this.currentLogo = result['success']['data'][0].logo;
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
    const formData = new FormData();
    for ( var key in companyForm) {
      if (companyForm[key] !== null) {
        formData.append(key, companyForm[key]);
      }
    }
    if (this.logo) {
      formData.set('logo', this.logo);
    } else {
      formData.set('logo', this.currentLogo);
    }
    if (this.headerBgColor) {
      formData.set('headerBgColor', this.headerBgColor);
    }
    if (this.headerTextColor) {
      formData.set('headerTextColor', this.headerTextColor);
    }
    formData.append("id", this.company._id);
    this.companyService.editCompany(formData).subscribe(result => {
      if (result['success']) {
        this.getDetails();
      }
    });
  }

  onFileChange(event) {
    const reader = new FileReader();
    if (event && event.length) {
      if (event[0].type.includes('jpg') || event[0].type.includes('jpeg') || event[0].type.includes('png')) {
        reader.onload = () => {
          this.logo = event[0];
          // this.companyDetails.get(['logo']).setValue(event[0]);          
        }
        reader.readAsDataURL(event[0]);
      } else {
        this.companyDetails.get(['logo']).setValue('');
        this.logo = null;
      }
    } else {
      this.companyDetails.get(['logo']).setValue('');
      this.logo = null;
    }
  }

  onBgColorChange(color) {
    this.headerBgColor = color;
  }

  onTextColorChange(color: any) {
    this.headerTextColor = color;
  }
}