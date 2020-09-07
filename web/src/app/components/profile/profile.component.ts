import {Component, OnInit} from '@angular/core';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {Router, Params, ActivatedRoute} from '@angular/router';
import {ValidationService} from '../../services/validation.service';
import {AccountService, AuthStorage} from '../../services/account.service';
import {ConstService} from '../../services/const.service';

declare var SiteJS: any;

@Component({
    selector: 'app-profile',
    templateUrl: 'profile.component.html',
    providers: [ValidationService, AccountService]
})
export class ProfileComponent implements OnInit {

    profileForm: FormGroup;
    passwordForm: FormGroup;
    errorMessage: string;
    currentUser: any = {};
    userPicUrl: any;
    user: any;
    fileToUpload: any;
    loading = false;
    profileSubmit = false;
    passwordSubmit = false;
    submitted = false;
    authStorage = new AuthStorage();
    profileError = false;

    constructor(private accountService: AccountService,
                private router: Router,
                private validationService: ValidationService,
                private fbuilder: FormBuilder,
                private constService: ConstService,
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
        this.accountService.getUser().subscribe(result => {
            if (result['success']['data']) {
                const authData = this.authStorage.getAuthData();
                console.log('authData', authData['data']);
                if (authData['data'].isPicture) {
                    this.userPicUrl = this.constService.publicUrl + '/api/user/profile/' + authData['data'].id;
                }
                this.profileForm = this.fbuilder.group({
                    firstName: [result['success']['data'].firstName || '', [<any>Validators.required], this.validationService.nameValid],
                    lastName: [result['success']['data'].firstName || '', [], this.validationService.nameValid],
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
            this.accountService.updateUserData(formData).subscribe(result => {
                if (result['success'] && result['success']['data']) {
                    const authData = this.authStorage.getAuthData();
                    authData['data']['displayName'] = result['success']['data']['name'];
                    if (result['success']['data']['picture']) {
                        authData['data']['isPicture'] = true;
                    }
                    this.authStorage.setAuthorizationHeader(authData);
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
                this.accountService.updateUserData(passwordFormDetail).subscribe(result => {
                    if (result['success'] && result['success']['data']) {
                    } else if (result['error']) {
                        alert(result['error']['message']);
                    } else {
                        alert('Error! Please try again later.');
                    }
                    this.submitted = false;
                    this.passwordSubmit = false;
                }, error => {
                    this.submitted = false;
                    this.passwordSubmit = false;
                    console.log(error);
                    alert('Error! Please try again later.');
                });
            }

        }
    }

}
