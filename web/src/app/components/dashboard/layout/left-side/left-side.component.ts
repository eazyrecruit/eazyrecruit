import {Component, OnInit, OnDestroy } from '@angular/core';
import {Router} from '@angular/router';
import {SharedService} from '../../../../services/shared.service';
import {AccountService, AuthStorage} from '../../../../services/account.service';
import {CompanyService} from '../../../../services/company.service';
import {ConstService} from '../../../../services/const.service';

declare var SiteJS: any;

@Component({
    selector: 'app-left-side',
    templateUrl: './left-side.component.html',
    providers: [AccountService, CompanyService]
})
export class LeftSideComponent implements OnInit {

    biglogo: boolean = true;
    username: any;
    role: any;
    authStorage = new AuthStorage();
    userPicUrl: any;
    constructor(private sharedService: SharedService,
                private router: Router,
                private constService: ConstService,
                private accountService: AccountService) {
    }

    ngOnInit() {
        this.username = this.sharedService.getLoggedInUsername();
        this.role = this.accountService.getRole();

        const authData = this.authStorage.getAuthData();
        if (authData['data'].isPicture) {
            this.userPicUrl = this.constService.publicUrl + '/api/user/profile/' + authData['data'].id + '?' + + new Date().getTime()  ;
        }
    }

    logout() {
        this.sharedService.logout();
        this.router.navigate(['/login']);
    }

    sidebarMenu() {
        //SiteJS.collaspeArrow();
    }

}
