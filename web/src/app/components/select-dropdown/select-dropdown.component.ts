import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
//import { InterviewerService } from '../../services/interview.service';
import { SkillsService } from '../../services/skills.service';
import { LocationService } from '../../services/location.service';

@Component({
  selector: 'app-select-dropdown',
  templateUrl: './select-dropdown.component.html',
  styleUrls: ['./select-dropdown.component.css'],
  providers: [ SkillsService, LocationService]
})
export class SelectDropdownComponent implements OnInit {

  @Input('jobPostId')
  jobPostId: any;

  @Input('skill')
  skill: any;

  @Input('location')
  location: any;

  @Output() data: EventEmitter<any> = new EventEmitter<any>();

  itemList: any = [];
  selectedItems = [];
  settings = {};
  filter: any = {};

  constructor(
    //private interviewerService: InterviewerService,
    private skillsService: SkillsService,
    private locationService: LocationService) { }
  ngOnInit() {

    this.settings = {
      text: 'Select ',
      singleSelection: false,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      primaryKey: 'id',
      labelKey: ['first_name'],
      noDataLabel: 'Search',
      enableSearchFilter: true,
      searchBy: ['first_name', 'last_name']
    };

    // this.data.emit(['name1', 'name2', 'name3']);
  }
  onSearch(evt: any) {
    this.itemList = [];
    if(this.skill) { 
      this.filter.pageSize = 20;
      this.filter.offset = 0;
      this.filter.searchText = evt.target.value;
      this.skillsService.getSkills(this.filter).subscribe(result => {
        if (result['success']) {
          this.itemList = result['success']['data']['rows'];
        }
      }, err => {
        alert('fail');
      });
    } else if(this.location) {
      this.filter.pageSize = 20;
      this.filter.offset = 0;
      this.filter.searchText = evt.target.value;
      this.locationService.getAllCities(this.filter).subscribe(result => {
        if (result['success']) {
          this.itemList = result['success']['data'];
        }
      }, err => {
        alert('fail');
      });
    } else {
      // this.interviewerService.getInterviewer(evt.target.value).subscribe(result => {
      //   if (result['success']) {
      //     this.itemList = result['success']['data'];
      //   }
      // }, (err) => { });
    }
  }
  onItemSelect(item: any) {
    if(this.jobPostId) {
      const interviewer: any = {};
      this.selectedItems.forEach(element => {
        element.jobPostId = this.jobPostId;
      });
      interviewer.interviewer = this.selectedItems;
      // this.interviewerService.assignInterviewerTojob(interviewer).subscribe(result => {
      //   if (result['success']) {
      //     this.itemList = result['success']['data'];
      //   }
      // }, (err) => { });
    } else {
      this.data.emit(this.selectedItems);
    }
  }
  OnItemDeSelect(item: any) {
  }
  onSelectAll(items: any) {
  }
  onDeSelectAll(items: any) {
  }

}
