import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from '../../../services/shared.service';
import { AccountService } from '../../../services/account.service';
import { CompanyService } from '../../../services/company.service';
declare var SiteJS : any;
@Component({
  selector: 'app-left-side',
  templateUrl: './left-side.component.html',
  styleUrls: ['./left-side.component.css'],
  providers: [AccountService, CompanyService]
})
export class LeftSideComponent implements OnInit {

  biglogo: boolean = true;
  username: any;
  role: any;
  logo: any;

  constructor(private sharedService: SharedService, 
    private router: Router,
    private accountService: AccountService,
    private companyService: CompanyService) { }

  ngOnInit() {
    this.username = this.sharedService.getLoggedInUsername();
    this.role = this.accountService.getRole();
    this.companyService.getCompany().subscribe(result => {
      if (result['success'] && result['success']['data'] && result['success']['data'].length) {
        this.logo = result['success']['data'][0].logo;
      }
    });
  }

  logout() {
    this.sharedService.logout();
    this.router.navigate(['/login']);
  }

  sidebarMenu(){
    //SiteJS.collaspeArrow();
  }

}
