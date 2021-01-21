import {Component, OnInit, OnDestroy} from '@angular/core';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {Router, Params, ActivatedRoute} from '@angular/router';
import {ValidationService} from '../../../services/validation.service';
import {AccountService, AuthStorage} from '../../../services/account.service';
import {ConstService} from '../../../services/const.service';
import {ToasterService} from 'angular2-toaster';
import {Subscription} from 'rxjs';

declare var SiteJS: any;

@Component({
    templateUrl: 'profile.component.html',
    providers: [ValidationService, AccountService]
})
export class ProfileComponent implements OnInit, OnDestroy {

    profileForm: FormGroup;
    passwordForm: FormGroup;
    errorMessage: string;
    userPicUrl: any;
    user: any;
    fileToUpload: any;
    loading = false;
    profileSubmit = false;
    passwordSubmit = false;
    submitted = false;
    authStorage = new AuthStorage();
    profileError = false;
    isLoginWithGoogle = true;
    private _subs: Subscription;

    constructor(private accountService: AccountService,
                private router: Router,
                private validationService: ValidationService,
                private fbuilder: FormBuilder,
                private constService: ConstService,
                private toasterService: ToasterService,
                private route: ActivatedRoute) {
        this.passwordForm = this.fbuilder.group({
            oldPassword: ['', [<any>Validators.required]],
            newPassword: [null, [<any>Validators.required, Validators.minLength(6)]],
            confirmPassword: [null, [<any>Validators.required, Validators.minLength(6)]]
        });

        this.profileForm = this.fbuilder.group({
            firstName: ['', [<any>Validators.required], this.validationService.nameValid],
            lastName: ['', [], this.validationService.nameValid],
            email: [''],
            phoneNo: ['', [], this.validationService.mobileValid]
        });

    }

    onFileChange(event) {
        if (event.target.files.length > 0) {
            this.profileError = false;
            const reader = new FileReader();
            const file = event.target.files[0];
            if (file.type.includes('jpg') || file.type.includes('jpeg') || file.type.includes('png')) {
                reader.readAsDataURL(file);
                reader.onload = (_event) => {
                    this.userPicUrl = reader.result;
                    // console.log(file)

                };
                this.fileToUpload = file;
            } else {
                this.profileError = true;
            }

            // this.registerForm.patchValue({
            //     fileSource: file
            // });
        }
    }

    onRemovePhoto() {
        this.fileToUpload = null;
        this.userPicUrl = null;
        this.profileError = false;
    }

    ngOnInit() {
        this._subs = this.accountService.getUser().subscribe(result => {
            if (result['success']['data']) {
                if (result['success']['data']['password']) {
                    this.isLoginWithGoogle = false;
                }
                if (result['success']['data'].picture) {
                    this.userPicUrl = this.constService.publicUrl + '/api/user/profile/' + result['success']['data']._id +
                        '?' + +new Date().getTime();
                }
                this.profileForm = this.fbuilder.group({
                    firstName: [result['success']['data'].firstName || '', [<any>Validators.required], this.validationService.nameValid],
                    lastName: [result['success']['data'].lastName || '', [], this.validationService.nameValid],
                    email: [result['success']['data'].email],
                    phoneNo: [result['success']['data'].phone || '', [], this.validationService.mobileValid]
                });
                this.passwordForm = this.fbuilder.group({
                    oldPassword: ['', [<any>Validators.required]],
                    newPassword: [null, [<any>Validators.required, Validators.minLength(6)]],
                    confirmPassword: [null, [<any>Validators.required, Validators.minLength(6)]]
                });
            } else {
                this.router.navigate(['/']);
            }

        });

    }

    onCancel() {
        this.router.navigate(['/']);
    }

    submit(formDetail: any) {
        const formData = new FormData();
        const fileData = this.fileToUpload;
        this.submitted = true;
        if (!this.profileForm.valid) {
            this.validationService.validateAllFormFields(this.profileForm);
        } else if (this.profileForm.valid && !this.profileError) {
            for (const key in formDetail) {
                if (formDetail.hasOwnProperty(key)) {
                    formData.append(key, formDetail[key]);
                }

            }
            if (fileData) {
                formData.append('profilePicture', fileData);
            } else if (!this.userPicUrl) {
                formData.append('isRemovePhoto', 'true');
            }
            this.profileSubmit = true;
            this._subs = this.accountService.updateUserData(formData).subscribe(result => {
                if (result['success'] && result['success']['data']) {
                    this.fileToUpload = null;
                    const authData = this.authStorage.getAuthData();
                    authData['data']['displayName'] = result['success']['data']['name'];
                    authData['data']['isPicture'] = !!result['success']['data']['picture'];
                    this.toasterService.pop('success', 'Profile updated', 'Profile updated successfully');
                    localStorage.removeItem('auth_data');
                    this.authStorage.setAuthorizationHeader(authData);
                    if (result['success']['data']['picture']) {
                        this.userPicUrl = this.constService.publicUrl + '/api/user/profile/' + result['success']['data']._id +
                            '?' + +new Date().getTime();
                        document.getElementById('left-side-userPicUrl').innerHTML =
                            '<img src=' + this.userPicUrl + ' class="img-circle" alt="User Image">';
                    } else {
                        document.getElementById('left-side-userPicUrl').innerHTML =
                            '<img src="/admin/assets/img/amir.png" class="img-circle" alt="User Image">';
                    }


                    // this.router.navigate(['/']);
                } else if (result['error']) {
                    alert(result['error']['message']);
                } else {
                    alert('Error! Please try again later.');
                }
                this.profileSubmit = false;
            }, error => {
                this.profileSubmit = false;
                console.log(error);
                alert('Error! Please try again later.');
            });
        }
    }

    updatePassword(passwordFormDetail: any) {
        if (!this.passwordForm.valid) {
            this.validationService.validateAllFormFields(this.passwordForm);
        }
        if (this.passwordForm.valid) {
            if (this.passwordForm.valid && (passwordFormDetail.confirmPassword === passwordFormDetail.newPassword)) {
                this.passwordSubmit = true;
                this._subs = this.accountService.updateUserData(passwordFormDetail).subscribe(result => {
                    if (result['success'] && result['success']['data']) {
                        this.toasterService.pop('success', 'Password updated', 'Password updated successfully');
                    } else if (result['error']) {
                        alert(result['error']['message']);
                    } else {
                        alert('Error! Please try again later.');
                    }
                    this.passwordForm.reset();
                    this.submitted = false;
                    this.passwordSubmit = false;
                }, error => {
                    this.passwordForm.reset();
                    this.submitted = false;
                    this.passwordSubmit = false;
                    console.log(error);
                    alert('Error! Please try again later.');
                });
            }

        }
    }

    ngOnDestroy(): void {
        if (this._subs) {
            this._subs.unsubscribe();
        }
    }
}
