import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {AccountService, AuthGuard, RoleGuardService} from '../../services/account.service';
import {Router, ActivatedRoute} from '@angular/router';
import {ValidationService} from '../../services/validation.service';

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
                private validationService: ValidationService,
                private authGuardService: AuthGuard) {
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
                    console.log('role', role);
                    this.router.navigate([this.accountService.getHomeUrl(role)]);
                } else {
                    this.errorMessage = result['error']['data'];
                }
            }, (err) => {
                this.errorMessage = err.error.error.message;
                console.log('login-error', 'Erron in Login');
            });
        }
    }

    oauthLogin(app) {
        SiteJS.oauthpopup(
            '/admin/assets/auth.html?socialApp=' + app, () => {
                const user = this.accountService.isAuthorized();
                if (user && user.isAuthorized) {
                    this.router.navigate([this.accountService.getHomeUrl(user.role)]);
                } else {
                    this.router.navigate(['/login']);
                }
            }
        );
    }


}
