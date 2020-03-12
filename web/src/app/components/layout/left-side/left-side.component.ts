import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from '../../../services/shared.service';
declare var SiteJS : any;
@Component({
  selector: 'app-left-side',
  templateUrl: './left-side.component.html',
  styleUrls: ['./left-side.component.css']
})
export class LeftSideComponent implements OnInit {

  biglogo: boolean = true;
  username: any;

  constructor(private sharedService: SharedService, private router: Router) { }

  ngOnInit() {
    this.username = this.sharedService.getLoggedInUsername();

  }

  logout() {
    this.sharedService.logout();
    this.router.navigate(['/login']);
  }

  sidebarMenu(){
    //SiteJS.collaspeArrow();
  }

}
