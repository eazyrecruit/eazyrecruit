import {Component, OnInit} from '@angular/core';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {Router, Params, ActivatedRoute} from '@angular/router';
import {ValidationService} from '../../services/validation.service';
import {AccountService, AuthStorage} from '../../services/account.service';
import {ConstService} from '../../services/const.service';
import {ToasterService} from 'angular2-toaster';

declare var SiteJS: any;

@Component({
    selector: 'app-profile',
    templateUrl: 'database.component.html',
    providers: [ValidationService]
})
export class DatabaseComponent implements OnInit {


    constructor(private accountService: AccountService,
                private router: Router,
                private validationService: ValidationService,
                private fbuilder: FormBuilder,
                private constService: ConstService,
                private toasterService: ToasterService,
                private route: ActivatedRoute) {


    }

    ngOnInit() {


    }

}
