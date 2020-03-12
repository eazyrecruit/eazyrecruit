import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../../services/shared.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  providers: [SharedService]
})
export class HeaderComponent implements OnInit {
  biglogo: boolean = true;
  username: any;
  constructor(
    private sharedService: SharedService,
    private router: Router
  ) {

  }

  ngOnInit() {
    this.username = this.sharedService.getLoggedInUsername();
  }

  logout() {
    this.sharedService.logout();
    this.router.navigate(['/login']);
  }
}
