import { Component, OnInit, Output, EventEmitter, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { SearchService } from '../../services/search.service';
import { JobService } from '../../services/job.service';
import { saveAs } from 'file-saver';
import { ApplyJobService } from '../../services/apply-job.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ApplicantService } from '../../services/applicant.service';
import { ApplicantDataService } from '../../services/applicant-data.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { RegisterApplicantComponent } from '../onboarding/register-applicant/register-applicant.component';
import { ToasterModule, ToasterService, ToasterConfig } from 'angular2-toaster';
import { UploadResumeComponent } from './upload-resume/upload-resume.component';
import { CreateApplicantComponent } from './create-applicant/create-applicant.component';

@Component({
  selector: 'app-applicants',
  templateUrl: './applicants.component.html',
  providers: [SearchService, JobService, ApplyJobService, ApplicantService, ApplicantDataService, BsModalService]
})
export class ApplicantsComponent implements OnInit {

  searchForm: FormGroup;
  applicantJobs: FormGroup;
  applicantForm: FormGroup;
  errCategory = false;
  searchList = [];
  params: any = {};
  limit = 10;
  offset = 0;
  file: File;
  candidates = [];
  ApplicantList = [];
  isJobSelected: Boolean;
  applicant: any;
  filter: any;
  totalRecords = 0;
  dataTableName = "applicant";
  isResultAvailable = false;
  modalRef: BsModalRef;

  jobId: any;
  pipeId: any;
  job: any;

  @Output()
  onSelect: EventEmitter<any> = new EventEmitter();

  constructor(private searchService: SearchService,
    private fb: FormBuilder,
    private jobService: JobService,
    private applyJobService: ApplyJobService,
    private router: Router,
    private activateRoute: ActivatedRoute,
    private applicantService: ApplicantService,
    private applicantDataService: ApplicantDataService,
    private modalService: BsModalService) {
    this.searchForm = fb.group({
      search: [null, [<any>Validators.required]],
      category: [null, [<any>Validators.required]]
    });

    this.applicantJobs = fb.group({
      job: [null, []]
    });

    this.applicantForm = fb.group({
      selectedResult: [null]
    });

    this.activateRoute.params.subscribe((params) => {
      this.jobId = params.jobId ? params.jobId : null;
      this.pipeId = params.pipelineId ? params.pipelineId : null;
    });
  }

  ngOnInit() {
    this.filter = {
      pageIndex: 1,
      pageSize: 10,
      searchText: '',
      sortField: 'firstName',
      sortOrder: '1',
      offset: 0
    };

    if (this.jobId) {
      this.jobService.getJobById(this.jobId).subscribe(result => {
        if (result['success']) {
          this.job = result['success']['data'];
        }
      });
    }
  }

  openCandidate(applicantId: any) {
    this.applicant = { _id: applicantId, isApplicantList: true };
    SiteJS.slideOpen('applicant-info');
  }

  getFullName(firstName, middleName, lastName) {
    var name = firstName;
    if (middleName && middleName != "null") name = name + " " + middleName;
    if (lastName && lastName != "null") name = name + " " + lastName;
    return name;
  }

  downloadResume(resumeId: any) {
    this.searchService.downloadPdf(resumeId).subscribe(
      (res) => {
        saveAs(res, 'resume');
        const fileURL = URL.createObjectURL(res);
        window.open(fileURL);
      }
    );
  }

  addApplicantToJob(applicantId: any) {
    this.jobService.addJobApplicant({ jobId: this.jobId, pipelineId: this.pipeId, applicantId: applicantId }).subscribe(result => {
      if (result['success'] && result['success']['data']) {
        //this.toasterService.pop('success', 'Success', 'Applicant added to the job');
      } else {
        //this.toasterService.pop('error', 'Failed', 'Applicant not saved!');
      }
    });
  }

  resetfilter(filter) {
    this.filter = {
      pageIndex: filter.pageIndex,
      pageSize: filter.pageSize,
      searchText: filter.searchText,
      sortField: filter.sortField,
      sortOrder: filter.sortOrder
    };
  }

  goToCreate() {
    localStorage.removeItem('jid');
    localStorage.setItem('jid', JSON.stringify({
      id: null,
      title: null,
      cName: null,
      pipeId: null
    }));
    // this.router.navigate(['applicants/create']);
    this.modalRef = this.modalService.show(CreateApplicantComponent, { 
      class: 'modal-lg', 
      initialState: null
    });
    this.modalRef.content.closePopup.subscribe(result => {
        if (result) {
          this.ApplicantList.unshift(result['data']);
          this.totalRecords++; 
        }
    });
  }

  onFilterChange(filter: any) {
    this.filter.offset = (filter.pageIndex - 1) * filter.pageSize;
    this.filter.searchText = filter.searchText;
    this.filter.pageSize = filter.pageSize;
    if (filter.searchName || filter.searchExperience || filter.searchLocation) {
      this.filter.advanceSearch = filter;
    } else {
      this.filter.advanceSearch = null;
    }
    this.searchService.getData(this.filter).subscribe((result) => {
      if (result['success'] && result['success']['data']) {
        this.ApplicantList = result['success']['data'].applicants;
        this.totalRecords = result['success']['data'].total;
      } else {
        //this.toasterService.pop('error', 'Not Found', 'Applicant records not found.');
      }
    });
  }

  // getCandidates(limit: any, offset: any) {
  //   this.applicantService.getAllCandidates(this.filter).subscribe(result => {
  //     if (result['success']) {
  //       this.candidates = result['success']['data'];
  //       this.toasterService.pop('success', 'Retreived successfully', 'Data retreived.');
  //     }
  //   });
  // }

  uploadResume() {
    this.modalRef = this.modalService.show(UploadResumeComponent);
    this.modalRef.content.onClose.subscribe(result => {
      if (result) {
        console.log('new applicant : ', result);
        this.ApplicantList.unshift(result);
        this.totalRecords++; 
        //this.toasterService.pop('success', 'Success', 'Resume uploaded successfully.');
      }
    });
  }

  onUpdate($event) {
    for (let i = 0; i < this.ApplicantList.length; i++) {
      if ($event._id == this.ApplicantList[i]._id) {
        this.ApplicantList[i] = $event;
      }
    }
  }
}
