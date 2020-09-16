import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { SearchService } from '../../../services/search.service';
import { ApplicantsearchService } from './applicantsearch.service';
import { PipelineComponent } from '../pipeline/pipeline.component';
import { ApplicantCardComponent } from '../applicantCard/applicant.card.component';
import { ValidationService } from '../../../services/validation.service';

@Component({
  selector: 'applicant-search',
  templateUrl: './applicantsearch.component.html',
  styleUrls: ['./applicantsearch.component.css'],
  providers: [SearchService, ApplicantsearchService, ValidationService]
})
export class ApplicantSearchComponent implements OnInit, OnDestroy {

  @Input('jobPostId')
  jobPostId: any;

  @Input('alreadyApplied')
  alreadyApplied: any;

  @Output() data: EventEmitter<any> = new EventEmitter<any>();

  searchForm: FormGroup;
  applicantJobs: FormGroup;
  applicantForm: FormGroup;
  searchDetails: FormGroup;
  searchList = [];
  advanceSearchResult = [];
  list: any = [];
  items: any = [];
  filter: any;
  applicant: any = {};
  isSearchResultAvail = 0;
  applicantCard: ApplicantCardComponent;
  isLoading: boolean = false;
  isSearchTerm: any = 0;
  matchedSkills = [];
  isCheckBoxCheked = false;

  constructor(
    private fb: FormBuilder,
    private searchService: SearchService, private applicantSearch: ApplicantsearchService,
    private validationService: ValidationService
  ) {
    this.searchDetails = this.fb.group({
      skills: [null],
      location: [null],
      minExperience: [null, [], this.validationService.experienceValid],
      maxExperience: [null, [], this.validationService.experienceValid],
      currentPackage: [null, [], this.validationService.ctcValid],
      expectedPackage: [null, [], this.validationService.ctcValid]
    });
  }

  ngOnInit() {
    this.filter = {
      pageIndex: 1,
      pageSize: 10,
      skills: '',
      location: '',
      minExperience: '',
      maxExperience: '',
      currentPackage: '',
      expectedPackage: '',
      sortField: '',
      sortOrder: '1',
      offset: 0
    };

    this.applicantForm = this.fb.group({
      items: this.fb.array([])
    });
  }

  addItem(data: any): void {
    this.items = this.applicantForm.get('items') as FormArray;
    this.items.push(this.createItem(data));
  }
  get formData() {
    return <FormArray>this.applicantForm.get('items');
  }

  createItem(value: any): FormGroup {
    if (value) {
      return this.fb.group({
        selectedResult: [false, { disabled: value.email.length > 0 ? true : false }]
      });
    }
  }

  submitData(data: any) {
    let list = [];
    let dataList = [];
    let counter = 0;

    if (data) {
      this.isLoading = true;
      data.items.forEach(element => {
        if (element.selectedResult && this.advanceSearchResult[counter].email.length > 0) {
          list.push(this.advanceSearchResult[counter].email);
          dataList.push(this.advanceSearchResult[counter]);
        }
        counter++;
      });

      let obj: any = {};
      obj.email = list;
      obj.data = dataList;
      obj.jobPostId = this.jobPostId;
      this.searchService.saveSearchResult(obj).subscribe(result => {
        if (result['success']) {
          if (result['success']['data'][0].message) { alert(result['success']['data'][0].message); }
          this.data.emit(true);
          this.ngOnDestroy();
        } else {
          alert('error');
          this.data.emit(false);
          this.ngOnDestroy();
        }
        this.advanceSearchResult = [];
        this.advanceSearchResult.length = 0;
        this.clearFormArray(this.applicantForm.controls.items);
        this.isLoading = false;
      });
    }
  }

  search() {
    this.filter.offset = this.filter.offset;
    this.filter.skills = this.searchDetails.controls.skills.value,
      this.filter.location = this.searchDetails.controls.location.value,
      this.filter.minExperience = this.searchDetails.controls.minExperience.value,
      this.filter.maxExperience = this.searchDetails.controls.maxExperience.value,
      this.filter.currentPackage = this.searchDetails.controls.currentPackage.value,
      this.filter.expectedPackage = this.searchDetails.controls.expectedPackage.value,
      this.filter.pageSize = this.filter.pageSize;
    this.getRecords(this.filter);
  }

  onFilterChange(filter: any) {
    this.filter.offset = (filter.pageIndex - 1) * filter.pageSize;
    this.filter.skills = this.searchDetails.controls.skills.value,
      this.filter.location = this.searchDetails.controls.location.value,
      this.filter.minExperience = this.searchDetails.controls.minExperience.value,
      this.filter.maxExperience = this.searchDetails.controls.maxExperience.value,
      this.filter.currentPackage = this.searchDetails.controls.currentPackage.value,
      this.filter.expectedPackage = this.searchDetails.controls.expectedPackage.value,
      this.filter.pageSize = filter.pageSize;
    this.getRecords(this.filter);
  }

  getRecords(filter) {
    this.advanceSearchResult = [];
    this.applicantForm.reset();
    if (this.searchDetails.get(['skills']).value || this.searchDetails.get(['location']).value ||
      this.searchDetails.get(['minExperience']).value || this.searchDetails.get(['maxExperience']).value ||
      this.searchDetails.get(['currentPackage']).value || this.searchDetails.get(['expectedPackage']).value) {
      this.isSearchTerm = 1;
    } else {
      this.isSearchTerm = 2;
    }

    if (this.isSearchTerm == 1) {
      this.searchService.getSearchResult(filter).subscribe(result => {
        if (result['success']) {
          if (result['success']['data'].length) {
            this.advanceSearchResult = result['success']['data'];
            this.list = result['success']['data'];
            for (let i = 0; i < this.list.length; i++) {
              this.addItem(this.list[i]);
            }

            this.advanceSearchResult.forEach(element => {
              if (element.email) {
                for (let i = 0; i < element.email.length; i++) {
                  for (let j = 0; j < this.alreadyApplied.length; j++) {
                    if (element.email[i] == this.alreadyApplied[j]) {
                      element.applied = true;
                    }
                  }
                }
              }
            });

            this.advanceSearchResult.forEach(element => {
              let skills = this.filterApplicantSkills(element.skills);
              element.matchScore = skills.size / this.matchedSkills.length * 100;
            });

            this.isSearchResultAvail = 1;
          } else {
            this.isSearchResultAvail = 2;
          }
        }
      }, (err) => {
        alert('Error');
      });
    }

  }


  name_clicked(id) {
    this.applicantSearch.getApplicantInfo(id).subscribe(result => {
      if (result['success']) {
        this.applicant.applicant = result['success']['data'];
        let nameArray = this.applicant.applicant.name.split(/[ ]+/);
        this.applicant.applicant.first_name = nameArray.length > 2 ? nameArray[0] + ' ' + nameArray[1] : nameArray[0];
        this.applicant.applicant.last_name = nameArray.length > 2 ? nameArray[2] : nameArray[1];
        this.applicant.matchedSkills = this.filterApplicantSkills(this.applicant.applicant.skills);
        this.applicant.skills = this.applicant.applicant.skills;
        this.applicant.location = this.applicant.applicant.addresses;
        this.applicant.applicantResumes = this.applicant.applicant.resumes;
        this.applicant.experiences = this.applicant.applicant.experiences
        this.data.emit(this.applicant);
      } else {
        alert('Fail');
      }
    });
    SiteJS.slideOpen('applicant-info');
  }

  filterApplicantSkills(skills: any) {
    this.matchedSkills = this.searchDetails.get(['skills']).value.split(/[,]+/);
    let i = 0;
    let matched = new Set();
    skills.forEach(element => {
      this.matchedSkills.forEach(skill => {
        if (element.toLowerCase().trim() === skill.toLowerCase().trim()) {
          matched.add(element);
          skills.splice(i, 1);
          i--;
        }
      });
      i++;
    });
    return matched;
  }

  clearFormArray(myForm) {
    while (myForm.length !== 0) {
      (this.applicantForm.get('items') as FormArray).removeAt(0);
    }
  }

  onCheck(event: any): boolean {
    let array = [];
    this.isCheckBoxCheked = false;
    array = this.applicantForm.get('items').value;
    array.forEach(element => {
      if (element.selectedResult) {
        this.isCheckBoxCheked = true;
      }
    });
    return this.isCheckBoxCheked;
  }

  ngOnDestroy(){
    this.searchDetails.reset();
    this.applicantForm.reset();

    this.advanceSearchResult = [];
    this.advanceSearchResult.length = 0;
    this.clearFormArray(this.applicantForm.controls.items);
    this.isLoading = false;

  }
}
