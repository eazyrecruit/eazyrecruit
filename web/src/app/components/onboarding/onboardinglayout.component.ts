import { Component, OnInit } from '@angular/core';
import { AuthStorage } from '../../services/account.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'onboarding-layout',
  templateUrl: './onboardinglayout.component.html'
})
export class OnboardingLayoutComponent implements OnInit {

  displayName: string;
  AuthStorage = new AuthStorage();
  authdata: any;

  constructor() { }

  ngOnInit() {
  }

}
