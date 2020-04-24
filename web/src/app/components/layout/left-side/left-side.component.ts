import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from '../../../services/shared.service';
import { AccountService } from '../../../services/account.service';
declare var SiteJS : any;
@Component({
  selector: 'app-left-side',
  templateUrl: './left-side.component.html',
  styleUrls: ['./left-side.component.css'],
  providers: [AccountService]
})
export class LeftSideComponent implements OnInit {

  biglogo: boolean = true;
  username: any;
  role: any;

  constructor(private sharedService: SharedService, 
    private router: Router,
    private accountService: AccountService) { }

  ngOnInit() {
    this.username = this.sharedService.getLoggedInUsername();
    this.role = this.accountService.getRole();
  }

  logout() {
    this.sharedService.logout();
    this.router.navigate(['/login']);
  }

  sidebarMenu(){
    //SiteJS.collaspeArrow();
  }

}
