import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css']
})
export class PopupComponent implements OnInit {

  selectedApplicant: any;
  jobId: any;
  emails = [];

  @Input('jobPostId')
  jobPostId: any; 
  @Input('alreadyApplied')
  alreadyApplied: any;
  @Input('title')
  title: string; 
  
  
  @Output()
  refresh: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges() {
    this.jobPostId;
    this.alreadyApplied;
    this.title;
  }

  eventHandler(event:any){

  }

  closeAndRefresh() {
    let closeB = document.getElementById('closeButton'); 
    closeB.click();
  }

}
