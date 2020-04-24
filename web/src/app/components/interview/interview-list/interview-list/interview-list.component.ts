import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'interview-list',
  templateUrl: './interview-list.component.html',
  styleUrls: ['./interview-list.component.css']
})
export class InterviewListComponent implements OnInit, OnChanges {

  @Input()
  interviews = [];

  constructor(private router: Router) {} 

  ngOnChanges(): void {
  }

  ngOnInit() {
  }

  openInterviewPage(id) {
    this.router.navigate([`interview/${id}`]);
  }

}
