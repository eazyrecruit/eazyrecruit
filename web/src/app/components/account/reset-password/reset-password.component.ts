import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, Params, ActivatedRoute } from '@angular/router';
import { ValidationService } from '../../../services/validation.service';
import { AccountService } from '../../../services/account.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  providers: [ValidationService, AccountService]
})
export class ResetPasswordComponent implements OnInit {

  passwordForm: FormGroup;
  errorMessage: string;
  otp: any;
  constructor(private accountService: AccountService,
    private router: Router,
    private fbuilder: FormBuilder,
    private validationService: ValidationService,
    private route: ActivatedRoute) {

    this.passwordForm = this.fbuilder.group({
      newPassword: [null, [<any>Validators.required, Validators.minLength(6)]],
      confirmPassword: [null, [<any>Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    let otp: any;
    this.route.params.subscribe((params: Params) => {
      otp = this.route.params['_value'].otp;
    });

    this.accountService.verifyOtp(otp).subscribe(result => {
      if (result['success']['data']) {
        this.otp = result['success']['data'].passwordResetToken;
      }
    });
  }

  login(passwordFormDetail: any) {

    if (!this.passwordForm.valid) {
      this.validationService.validateAllFormFields(this.passwordForm);
    }

    if (this.passwordForm.valid) {
      if (passwordFormDetail.confirmPassword === passwordFormDetail.newPassword) {
        this.errorMessage = '';
        passwordFormDetail.otp = this.otp;
        this.accountService.resetPassword(passwordFormDetail).subscribe(result => {
          if (result['success']) {
            this.router.navigate(['login']);
          } else {
            this.errorMessage = result['error']['message'];
          }
        }, (err) => { });
      } else {
        this.errorMessage = 'Password not match!';
      }

    }
  }

}
