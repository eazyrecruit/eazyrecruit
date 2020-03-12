import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { ValidationService } from '../../../services/validation.service';
import { SearchService } from '../../../services/search.service';
import { Router } from '@angular/router';
import {ToasterModule, ToasterService, ToasterConfig} from 'angular2-toaster';

@Component({
  selector: 'app-search-applicant',
  templateUrl: './search-applicant.component.html',
  providers: [ValidationService, SearchService]
})
export class SearchApplicantComponent implements OnInit, OnDestroy {

  searchDetails: FormGroup;
  applicantForm: FormGroup;

  filter: any;
  searchResult = [];
  items: any = [];
  totalRecords = 0;

  isSearchResult = false;
  isCheckBoxCheked = false;
  isLoading = false;
  showCheckBox = false;
  skillSearched = false;

  job: any;


  constructor(private fb: FormBuilder,
    private validationService: ValidationService,
    private searchService: SearchService,
    private router: Router,
    private toasterService: ToasterService) {
    this.searchDetails = this.fb.group({
      skills: [null],
      location: [null],
      // minExperience: [null, [], this.validationService.experienceValid],
      // maxExperience: [null, [], this.validationService.experienceValid],
      // currentPackage: [null, [], this.validationService.ctcValid],
      // expectedPackage: [null, [], this.validationService.ctcValid]
      minExperience: [null, []],
      maxExperience: [null, []],
      currentPackage: [null, []],
      expectedPackage: [null, []],
      name:  [null, [], this.validationService.nameValid],
      email: [null, [], this.validationService.emailValid]
    });
  }

  public config: ToasterConfig =  new ToasterConfig({
    showCloseButton: true,
    tapToDismiss: true,
    timeout: 1000,
    animation: 'fade',
    positionClass: 'toast-top-right'
  });

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

    this.job = JSON.parse(localStorage.getItem('jid'));
    if (this.job) {
      this.showCheckBox = true;
    }
    this.searchApplicant(this.filter);
  }

  ngOnDestroy(): void {
    localStorage.removeItem('jid');
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
        // selectedResult: [false, { disabled: value.email.length > 0 ? true : false }]
        selectedResult: [false]
      });
    }
  }

  clearFormArray(myForm) {
    while (myForm.length !== 0) {
      (this.applicantForm.get('items') as FormArray).removeAt(0);
    }
  }

  search() {
    this.isSearchResult = false;
    this.filter.offset = this.filter.offset;
    this.filter.name = this.searchDetails.controls.name.value;
    this.filter.email = this.searchDetails.controls.email.value;
    this.filter.skills = this.searchDetails.controls.skills.value,
    this.filter.location = this.searchDetails.controls.location.value,
    this.filter.minExperience = this.searchDetails.controls.minExperience.value,
    this.filter.maxExperience = this.searchDetails.controls.maxExperience.value,
    this.filter.currentPackage = this.searchDetails.controls.currentPackage.value,
    this.filter.expectedPackage = this.searchDetails.controls.expectedPackage.value,
    this.filter.pageSize = this.filter.pageSize;
    if (this.searchDetails.get(['skills']).value || this.searchDetails.get(['location']).value ||
      this.searchDetails.get(['minExperience']).value || this.searchDetails.get(['maxExperience']).value ||
      this.searchDetails.get(['currentPackage']).value || this.searchDetails.get(['expectedPackage']).value ||
      this.searchDetails.get(['name']).value || this.searchDetails.get(['email']).value) {
        this.searchApplicant(this.filter);
    }
  }

  searchApplicant(filter) {
    // this.searchDetails.reset();
    this.searchResult.length = 0;
    this.totalRecords = 0;
    this.searchService.getApplicant(filter).subscribe(result => {
      if (result['success']) {
        if (result['success']['data'].record.length) {
          this.searchResult = result['success']['data'].record;
          const array = result['success']['data'].record;
          array.forEach((element) => {
            this.addItem(element);
          });
          this.isSearchResult = true;
          this.totalRecords = result['success']['data'].count;
          this.toasterService.pop('success', 'Result found', 'Result found.');
          if (this.searchDetails.get(['skills']).value !== null) {
            this.skillSearched = true;
          } else {
            this.skillSearched = false;
          }
          const close = document.getElementById('close');
          close.click();
        } else {
          this.toasterService.pop('error', 'Not Found', 'No records founds.');
          this.searchResult = [];
        }
      } else {
        this.toasterService.pop('error', 'Not Found', 'No records founds.');
      }
    });
  }

  submitData(data: any) {
    const list = [];
    const dataList = [];

    if (data) {
      this.isLoading = true;
      data.items.forEach((element, index) => {
        if (element.selectedResult) {
          list.push(this.searchResult[index]._id);
          dataList.push(this.searchResult[index]);
        }
      });

      const obj: any = {};
      obj.ids = list;
      obj.data = dataList;
      obj.jobPostId = this.job.id;
      obj.pipelineId = this.job.pipeId;

      this.searchService.saveSearchResult(obj).subscribe(result => {
        // this.clearFormArray(this.applicantForm.controls.items);
        this.isLoading = false;
        if (result['success']['data'].newApplied.length > 0) {
          this.router.navigate(['/jobs/pipeline/' + this.job.id + '/' + this.job.title + '/' + this.job.cName]);
        } else if (result['success']['data'].alreadyApplied.length > 0) {
          this.toasterService.pop('error', 'Duplicate candidate', 'Candidate already exist in this job.');
          this.applicantForm.reset();
        }
      });
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

  goToCreate() {
    this.router.navigate(['applicants/create']);
  }

  getResult(filter) {
    this.filter.offset = (filter.pageIndex - 1) * filter.pageSize;
    this.filter.searchText = filter.searchText;
    this.filter.pageSize = filter.pageSize;
    this.filter.pageIndex = filter.pageIndex;
    this.searchService.getApplicant(this.filter).subscribe(result => {
      if (result['success']) {
        if (result['success']['data'].record.length) {
          this.searchResult = result['success']['data'].record;
          this.isSearchResult = true;
          this.totalRecords = result['success']['data'].count;
          this.toasterService.pop('success', 'Result found', 'Result found.');
          if (this.searchDetails.get(['skills']).value !== null) {
            this.skillSearched = true;
          } else {
            this.skillSearched = false;
          }
        } else {
          this.toasterService.pop('error', 'Not Found', 'No records founds.');
          this.searchResult = [];
        }
      } else {
        this.toasterService.pop('error', 'Not Found', 'No records founds.');
      }
    });
  }

}

