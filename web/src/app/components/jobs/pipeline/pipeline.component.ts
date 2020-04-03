import { Component, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { PipelineService } from './../../../services/pipeline.service';
import { SharedService } from '../../../services/shared.service';
import { DataShareService } from '../../../services/data-share.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ValidationService } from '../../../services/validation.service';
import { ApplicantDataService } from '../../../services/applicant-data.service';
import { BsModalService, BsModalRef } from 'ngx-bootstrap';
import { JobService } from '../../../services/job.service';
import { CreateApplicantComponent } from '../../applicants/create-applicant/create-applicant.component';
declare var SiteJS: any;

@Component({
  selector: 'app-pipeline',
  templateUrl: './pipeline.component.html',
  styleUrls: ['./pipeline.component.css'],
  providers: [PipelineService, SharedService, ValidationService, JobService]
})
export class PipelineComponent implements OnInit {

  job: any;

  items = [];
  selectedApplicant: any;
  jobId: any;
  parameter: any = {};
  event: any;
  emails = [];
  jobTitle: any;
  companyName: any;
  form: FormGroup;
  draggedItem: any;
  start: any;
  errorMessage: any;
  pipelineDialogTitle = 'Create';
  pipeline: any = {};
  modalRef: BsModalRef;

  constructor(private route: ActivatedRoute,
    private pipelineService: PipelineService,
    private sharedService: SharedService,
    private fb: FormBuilder,
    private dataShared: DataShareService,
    private router: Router,
    private validationService: ValidationService,
    private applicantDataService: ApplicantDataService,
    private jobService: JobService,
    private modalService: BsModalService) {
    this.form = fb.group({
      name: [null, [<any>Validators.required], validationService.jobTitleValid]
    });
  }

  onItemDrop(event: any, pipeline: any) {
    if (event.dragData.pipeline_id !== pipeline.id) {
      event.dragData.pipeline_id = pipeline.id;
      // change status
      this.changeStatus(event);
    }
  }

  showApplicantDetails(applicant: any) {
    this.selectedApplicant = applicant;
    SiteJS.slideOpen('applicant-info-pipeline');
  }

  ngOnInit() {
    //getting data from params
    this.route.params.subscribe((params: Params) => {
      this.getCandidate(params['jobId']);
    });
  }

  getCandidate(jobId) {
    if (jobId) {
      this.jobService.getWithApplicantsAndPipelineById(jobId).subscribe(result => {
        if (result['success']) {
          this.job = result['success'].data;
        }
      });
    }
  }

  saveData(id) {
    this.items.forEach(element => {
      if (element.id === id) {
        this.sharedService.setApplicantDetail(JSON.stringify(element));
      }
    });
  }

  changeStatus(obj) {
    const applicant: any = {};
    applicant.applicant = obj.dragData.applicant;
    applicant.pipeline = obj.dragData.pipeline;
    applicant.job = obj.dragData.job;
    applicant.id = obj.dragData.id;
    this.pipelineService.updateApplicantStatus(applicant).subscribe(result => {
      if (result['success']['data']) {
        this.ngOnInit();
      }
    });
  }

  eventHandler(event: any) {
    if (event.applicant) {
      this.showApplicantDetails(event);
    } else {
      this.closeAndRefresh();
    }
  }

  onCandidateReject(event: any) {
    if (event === 'candiateRemoved') {
      this.closeAndRefresh();
    }
  }

  closeAndRefresh() {
    const close = document.getElementById('closeButton');
    close.click();
    this.pipelineService.getApplicantsByJob(this.jobId).subscribe(result => {
      if (result['success']) {
        this.items = result['success']['data'];
        this.saveData(this.items['0'].id);
      }
    });
  }

  goToSearch(): void {
    // let pipe_id = 0;
    // if (this.pipelineArray.length > 0) {
    //   pipe_id = this.pipelineArray[0].id;
    // }
    // localStorage.setItem('jid', JSON.stringify({
    //   id: this.jobId,
    //   title: this.jobTitle,
    //   cName: this.companyName,
    //   pipeId: pipe_id
    // }));
  }

  onColumnDrop(event, item, index) {
    if (event && item && event.dragData.pipeline !== item._id) {
      const obj = {
        dragData: {
          pipeline: item._id,
          applicant: event.dragData.applicant ? event.dragData.applicant._id : event.dragData,
          job: event.dragData.job
        }
      };
      this.changeStatus(obj);

      // const newPosition = item.position;
      // const end = index;
      // const array = [];

      // if (this.start < end) {
      //   for (let i = this.start + 1; i <= end; i++) {
      //     const obj = this.pipelineArray[i];
      //     obj.position = obj.position - 1;
      //     array.push(obj);
      //   }
      // } else {
      //   for (let i = this.start; i >= end; i--) {
      //     let obj = this.pipelineArray[i];
      //     obj.position = i === this.start ? index : obj.position + 1;
      //     array.push(obj);
      //   }
      //}

      // const object = event.dragData;
      // object.position = newPosition;
      // array.push(object);

      // this.pipelineService.updatePipelinePosition(array).subscribe(result => {
      //   if (result['success']) {
      //     this.getPipelines(this.jobId);
      //   }
      // });
    }
  }

  onColumnDrag(event, item, i) {
    this.draggedItem = item;
    this.start = i;
  }

  addPipeline(form): void {
    let pipeObject;
    if (this.job.pipelines && this.job.pipelines.find(x => x.name.toUpperCase().trim() === form.name.toUpperCase().trim())) {
      return;
    }
    form.position = this.job.pipelines ? this.job.pipelines.length + 1 : 1;
    form.jobPostId = this.job._id;
    this.jobService.addPipeline(form, this.job._id).subscribe(result => {
      if (result['success']) {
        this.closeModal();
        this.job.pipelines.push(result['success']['data']);
        //this.getPipelines(this.jobId);
      }
    });
  }

  addApplicants() {
    if (this.job.pipelines && this.job.pipelines.length > 0) {
      this.router.navigate(['/applicants/add/job', this.job._id, this.job.pipelines[0]._id]);
    }
  }

  getPipelines(jobId): void {
    // get pipeline tabs
    // this.pipelineService.getPipelineTabs(jobId).subscribe(result => {
    //   if (result['success']) {
    //     this.pipelineArray = result['success']['data'];
    //     const array = result['success']['data'];
    //     array.forEach(element => {
    //       const arr = this.items.filter(x => x.pipeline_id === element.id);
    //       element.items = arr;
    //     });
    //     this.pipelineArray.sort(this.compare);
    //   }
    // });
  }

  compare(a, b) {
    if (a.position > b.position) {
      return 1;
    } else {
      return -1;
    }
  }

  editPipeline(name, tab) {
    tab.name = name;
    this.pipelineService.updatePipelineDetails(tab).subscribe(result => {
      if (result['success']) {
        this.closeModal();
        this.getPipelines(this.jobId);
      }
    });
  }

  // deletePipeline (tab) {
  //   this.pipelineService.deletePipeline(tab).subscribe(result => {
  //     if (result['success']) {
  //       this.getPipelines(this.jobId);
  //     }
  //   });
  // }

  pipelineDetails(pipeline: any) {
    if (!this.form.valid) {
      this.validationService.validateAllFormFields(this.form);
    } else {
      if (this.pipeline && this.pipeline.id > 0) {
        this.editPipeline(pipeline.name, this.pipeline);
      } else {
        this.pipelineDialogTitle = 'Create';
        this.addPipeline(pipeline);
      }
    }
  }

  populateForm() {
    if (this.pipeline && this.pipeline.id > 0) {
      this.form = this.fb.group({
        name: [this.pipeline.name, [<any>Validators.required]]
      });
    } else {
      this.form = this.fb.group({
        name: [null, [<any>Validators.required]]
      });
    }
  }

  setpipelineId(pipeline: any) {
    this.pipeline = pipeline;
    if (!this.pipeline) {
      this.pipelineDialogTitle = 'Create';
      this.form.reset();
    } else {
      this.pipelineDialogTitle = 'Edit';
      this.populateForm();
    }
  }

  onKeyPress(event) {
    if (event.target.value === '') {
      this.errorMessage = null;
    }
  }

  closeModal() {
    const close = document.getElementById('close');
    close.click();
  }

  goToApplicant(data) {
    this.applicantDataService.setApplicantId(data.applicant._id);
    this.router.navigate(['jobs/applicant']);
  }

  createApplicant(jobId) {
    let initialState = { jobId: jobId, pipelineId: null};
    if (this.job.pipelines && this.job.pipelines.length > 0) {
      initialState.pipelineId = this.job.pipelines[0]._id;
    }
    this.modalRef = this.modalService.show(CreateApplicantComponent, { 
      class: 'modal-lg', 
      initialState: initialState
    });
    this.modalRef.content.closePopup.subscribe(result => {
        if (result) {
          this.job.applicants.push(result['data']);
        }
    });
}

  goToCreate() {
    // let pipe_id = 0;
    // if (this.pipelineArray.length > 0) {
    //   pipe_id = this.pipelineArray[0].id;
    // }

    // if (pipe_id > 0) {
    //   // localStorage.setItem('job', JSON.stringify({ id: this.jobId, pipeId: pipe_id }));
    //   localStorage.setItem('jid', JSON.stringify({
    //     id: this.jobId,
    //     title: this.jobTitle,
    //     cName: this.companyName,
    //     pipeId: pipe_id
    //   }));
    //   this.router.navigate(['applicants/create']);
    // } else {
    //   this.toasterService.pop('error', 'Error', 'pipeline id is not available!');
    // }

  }

  searchApplicant(event: any) {
    const value = event.target ? event.target.value : '';
    this.jobService.searchWithApplicantsAndPipelineById(this.job._id, value).subscribe(result => {
      if (result['success']) {
        // const jobArray = result['success']['data'];
        // const personArray = result['success']['data'].person;
        // this.items.length = 0;
        // jobArray.forEach((element, index) => {
        //   const person = personArray.find(x => x._id === element.applicant.mongo_id);
        //   if (person) {
        //     element.applicant = person;
        //   }
        //   this.items.push(element);
        // });
        let applicants = result['success']['data'].applicants;
        let jobs = [];
        applicants.forEach(element => {
          if (element.applicant) {
            jobs.push(element);
          }
        });
        this.job.applicants = jobs;
      }
      // this.getPipelines(this.jobId);
    });
  }

  deletePipeline(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { class: 'modal-sm' });
  }

  confirm(pipelineId, index): void {
    this.pipelineService.deletePipeline(pipelineId).subscribe(result => {
      if (result['success']) {
        this.modalRef.hide();
        this.job.pipelines.splice(index, 1);
      }
    });
  }

  decline(): void {
    this.modalRef.hide();
  }

  changeApplicantStatus(applicant: any) {
    if (applicant && applicant.moveToPipeline && applicant.applicant._id) {
      const obj = {
        dragData: {
          pipeline: applicant.moveToPipeline,
          applicant: applicant.applicant._id,
          job: applicant.job,
          id: applicant._id  // job pipelineId
        }
      };
      this.changeStatus(obj);
    }
  }

  updateJobApplicantList(deleteResponse: any, index) {
    if (deleteResponse && deleteResponse.isDeleted === true) {
      this.job.applicants.splice(index, 1);
      SiteJS.stopLoader();
    } else {
      SiteJS.stopLoader();
    }
  }

  onUpdate($event) {
    for (let i = 0; i < this.job.applicants.length; i++) {
      if ($event._id == this.job.applicants[i].applicant._id) {
        this.job.applicants[i].applicant = $event;
      }
    }
  }
}
