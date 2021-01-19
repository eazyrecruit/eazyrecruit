import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AccountService} from '../../services/account.service';
import {Router} from '@angular/router';
import {ValidationService} from '../../services/validation.service';
import {ConstService} from '../../services/const.service';

@Component({
    selector: 'app-login',
    templateUrl: 'login.component.html',
    providers: [AccountService, ValidationService]
})
export class LoginComponent implements OnInit {

    loginForm: FormGroup;
    errorMessage: string;
    google;

    constructor(private accountService: AccountService,
                private router: Router,
                private constService: ConstService,
                private fbuilder: FormBuilder,
                private validationService: ValidationService) {

        this.google = `${this.constService.publicUrl}/admin/assets/auth.html?socialApp=google`;
        const user = this.accountService.isAuthorized();
        if (user && user.isAuthorized) {
            this.router.navigate([this.accountService.getHomeUrl(user.role)]);
        }
        this.loginForm = fbuilder.group({
            userName: [null, [<any>Validators.required], this.validationService.emailValid],
            password: [null, [<any>Validators.required]]
        });
    }

    ngOnInit() {

    }

    login(loginModel: any) {

        if (!this.loginForm.valid) {
            this.validationService.validateAllFormFields(this.loginForm);
        }

        if (this.loginForm.valid) {
            this.accountService.login(this.loginForm.value).subscribe(result => {
                if (result['success']) {
                    this.accountService.setAuthorizationHeader(result['success']);
                    const role = this.accountService.getRole();
                    this.router.navigate([this.accountService.getHomeUrl(role)]);
                } else {
                    this.errorMessage = result['error']['data'];
                }
            }, (err) => {
                this.errorMessage = err.error.error.message;
                console.log('login-error', 'Error in Login');
            });
        }
    }


}
