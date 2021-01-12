import {Injectable} from '@angular/core';
import {FormGroup, FormControl} from '@angular/forms';
import {Observable} from 'rxjs/internal/Observable';

@Injectable()
export class ValidationService {

    constructor() {
    }

    emailValid(control: FormControl): Promise<any> | Observable<any> {
        const promise = new Promise<any>((resolve, reject) => {
            if (control.value && !control.value.match(new RegExp(/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/))) {
                resolve({'emailValid': true});
            } else {
                resolve(null);
            }
        });
        return promise;
    }

    validateAllFormFields(formGroup: FormGroup) {
        Object.keys(formGroup.controls).forEach(field => {
            const control = formGroup.get(field);
            if (control && control instanceof FormControl) {
                control.markAsTouched({onlySelf: true});
            } else if (control instanceof FormGroup) {
                this.validateAllFormFields(control);
            }
        });
    }

    nameValid(control: FormControl): Promise<any> | Observable<any> {
        const promise = new Promise<any>((resolve, reject) => {
            if (control.value && !control.value.match(new RegExp(/^[a-zA-Z0-9\.\- ]+$/))) {
                resolve({'nameValid': true});
            } else {
                resolve(null);
            }

        });
        return promise;
    }

    jobTitleValid(control: FormControl): Promise<any> | Observable<any> {
        const promise = new Promise<any>((resolve, reject) => {
            if (control.value && !control.value.match(new RegExp(/^[0-9a-zA-Z-\s_\-\/]*$/))) {
                resolve({'jobTitleValid': true});
            } else {
                resolve(null);
            }

        });
        return promise;
    }

    mobileValid(control: FormControl): Promise<any> | Observable<any> {
        const promise = new Promise<any>((resolve, reject) => {

            // if (!control.value.match(new RegExp(/^(\+\d{1,3}[- ]?)?\d{11}$/))) {
            if (control.value && !control.value.match(new RegExp(/^(\d{10}((,\d{10})?)*)$/))) {
                resolve({'mobileValid': true});
            } else {
                resolve(null);
            }

        });
        return promise;
    }

    scoreValid(control: FormControl): Promise<any> | Observable<any> {
        const promise = new Promise<any>((resolve, reject) => {

            if (control.value && !control.value.match(new RegExp(/^([1-9]|10)$/))) {
                resolve({'scoreValid': true});
            } else {
                resolve(null);
            }

        });
        return promise;
    }

    jobExperience(control: FormControl): Promise<any> | Observable<any> {
        const promise = new Promise<any>((resolve, reject) => {

            if (control.value && !control.value.toString().match(new RegExp(/^\d{1,2}(\.\d{1,2})?(([\-])(\d{1,2}(\.\d{1,2})?))?$/))) {
                resolve({'jobExperience': true});
            } else {
                resolve(null);
            }

        });
        return promise;
    }

    experienceValid(control: FormControl): Promise<any> | Observable<any> {
        const promise = new Promise<any>((resolve, reject) => {

            if (control.value && !control.value.toString().match(new RegExp(/^\d{1,2}(\.\d{1,2})?$/))) {
                resolve({'experienceValid': true});
            } else {
                resolve(null);
            }

        });
        return promise;
    }

    rangeValid(control: FormControl): Promise<any> | Observable<any> {
        const promise = new Promise<any>((resolve, reject) => {

            if (control.value && !control.value.match(new RegExp(/^([0-9\-{1}\,]{1,500})$/))) {
                resolve({'rangeValid': true});
            } else {
                resolve(null);
            }

        });
        return promise;
    }

    ctcValid(control: FormControl): Promise<any> | Observable<any> {
        const promise = new Promise<any>((resolve, reject) => {
            // if (control.value && !control.value.match(new RegExp(/^([0-9\,]{1,500})$/))) {
            if (control.value && !control.value.toString().match(new RegExp(/^([0-9]*[.])?[0-9]+$/))) {
                resolve({'ctcValid': true});
            } else {
                resolve(null);
            }

        });
        return promise;
    }
}
