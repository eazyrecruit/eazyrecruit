import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AccountService, AuthGuard } from '../../services/account.service';
import { Router } from '@angular/router';
import { ValidationService } from '../../services/validation.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [AccountService, ValidationService]
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  errorMessage: string;
  constructor(private accountService: AccountService,
    private router: Router,
    private fbuilder: FormBuilder,
    private validationService: ValidationService, private authGuardService:AuthGuard) {

    this.loginForm = fbuilder.group({
      userName: [null, [<any>Validators.required], this.validationService.emailValid],
      password: [null, [<any>Validators.required]]
    });
  }

  ngOnInit() {
    if(this.authGuardService.canActivate()) {
      this.router.navigate(['jobs']);
    }
  }

  login(loginModel: any) {

    if (!this.loginForm.valid) {
      this.validationService.validateAllFormFields(this.loginForm);
    }

    if (this.loginForm.valid) {
      this.accountService.login(this.loginForm.value).subscribe(result => {
        if (result['success']) {
          this.accountService.setAuthorizationHeader(result['success']);
          this.router.navigate(['jobs']);
        } else {
          this.errorMessage = result['error']['data'];
        }
      }, (err) => {
        console.log('login-error', 'Erron in Login');
      });
    }
  }

  oauthLogin(app) {
    SiteJS.oauthpopup(
      "/admin/assets/auth.html?socialApp=" + app, () => {
        if(this.authGuardService.canActivate()) {
          this.router.navigate(['jobs']);
        }
          
      }
    );
  }


}
