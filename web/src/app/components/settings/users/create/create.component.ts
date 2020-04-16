import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ValidationService } from '../../../../services/validation.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AccountService } from '../../../../services/account.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css'],
  providers: [AccountService, ValidationService]
})
export class CreateComponent implements OnInit {
  
  isRoleSelect: boolean;
  adminDetails: FormGroup;
  isDetailsUploading = false;
  isSubmitDisabled = false;
  roles = [];

  constructor(private route: ActivatedRoute,
    private fbForm: FormBuilder,
    private router: Router,
    private validationService: ValidationService,
    private accountService: AccountService) {

      this.adminDetails = this.fbForm.group({
        firstName: [null, [<any>Validators.required], this.validationService.nameValid],
        lastName: [null, [], this.validationService.nameValid],
        email: [null, [<any>Validators.required], this.validationService.emailValid],
        phoneNo: [null, [], this.validationService.mobileValid],
        roleId: [null, []],
      });
    }

  ngOnInit() {
    this.accountService.getRoles().subscribe(result => {
      if (result['success']['data']) {
        this.roles = result['success']['data'];
      } else {
        alert('Error! Please try again later.');
      }
    });
  }

  details(adminFormDetail: any) {
    if (!this.adminDetails.valid) {
      this.validationService.validateAllFormFields(this.adminDetails);
    } else if (this.adminDetails.valid) {
      this.isDetailsUploading = true;
      adminFormDetail.roleId = this.roles;
      this.accountService.createUser(adminFormDetail).subscribe(result => {
        if (result['success']['data']) {
          this.adminDetails.reset();
        } else {
          alert('Error! Please try again later.');
        }
        this.isDetailsUploading = false;
      });
    }
  }

onRoleChnage(event) {
    const value = event.target.value;
    if (value) {
      this.roles.push(value);
      this.isRoleSelect = false;
    } else {
      this.isRoleSelect = true;
    }
  }
}
