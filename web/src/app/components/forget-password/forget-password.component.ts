import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, Params, ActivatedRoute } from '@angular/router';
import { ValidationService } from '../../services/validation.service';
import { AccountService } from '../../services/account.service';

declare var SiteJS: any;
@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  providers: [ValidationService, AccountService]
})
export class ForgetPasswordComponent implements OnInit {

  emailForm: FormGroup;
  errorMessage: string;
  otp: any;
  constructor(private accountService: AccountService,
    private router: Router,
    private fbuilder: FormBuilder,
    private validationService: ValidationService,
    private route: ActivatedRoute) {

    this.emailForm = this.fbuilder.group({
      email: [null, [<any>Validators.required]]
    });
  }

  ngOnInit() {}

  forget(formDetail: any) {

    if (!this.emailForm.valid) {
      this.validationService.validateAllFormFields(this.emailForm);
    }

    if (this.emailForm.valid) {
      this.errorMessage = '';
      formDetail.otp = this.otp;
      this.accountService.forgetPassword(formDetail).subscribe(result => {
        if (result['success']) {
          alert(result['success']['data']);
          this.router.navigate(['login']);
        } else {
          this.errorMessage = result['error']['message'];
          SiteJS.stopLoader();
        }
      }, (err) => {
        this.errorMessage = err.error.error.message
        SiteJS.stopLoader();
      });
    }
  }

}
