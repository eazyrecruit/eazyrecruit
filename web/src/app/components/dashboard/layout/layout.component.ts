import { Component, OnInit } from '@angular/core';
import { AuthStorage } from '../../../services/account.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html'
})
export class LayoutComponent implements OnInit {
  displayName: string;
  AuthStorage = new AuthStorage();
  authdata: any;
  constructor() { }

  ngOnInit() {
    // this.authdata = this.AuthStorage.getAuthData();
    // this.displayName = this.authdata.displayName;
  }

}
