import {Component, OnInit, TemplateRef} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {PipelineService} from '../../../services/pipeline.service';
import {SharedService} from '../../../services/shared.service';
import {DataShareService} from '../../../services/data-share.service';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {ValidationService} from '../../../services/validation.service';
import {ApplicantDataService} from '../../../services/applicant-data.service';
import {BsModalService, BsModalRef} from 'ngx-bootstrap';
import {JobService} from '../../../services/job.service';
import {CreateApplicantComponent} from '../../applicants/create-applicant/create-applicant.component';

declare var SiteJS: any;

@Component({
    selector: 'app-pipeline',
    templateUrl: './pipeline.component.html',
    styleUrls: ['./pipeline.component.css'],
    providers: [PipelineService, SharedService, ValidationService, JobService]
})
export class PipelineComponent implements OnInit {

    isGridView = true;
    jobId: any;
    filter = {
        pageIndex: 1, pageSize: 20, offset: 0, sortBy: 'modified_at', isGridView: false,
        order: -1, searchText: '', startDate: '', endDate: '', source: '', jobId: '',
    };
    pipeLines = [];
    totalRecords = 1;
    JobApplicants = [];

    bsConfig = Object.assign({}, {containerClass: 'theme-red'});
    gettingApplicant = false;
    searchText = '';
    sourceType = ['Email', 'Upload', 'Website', 'Db'];
    job: any;
    startDate = new Date();
    endDate = new Date();
    startMaxDate = new Date();
    endMinDate = new Date();
    endMaxDate = new Date();
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
    }


    ngOnInit() {
        this.startDate.setMonth(new Date().getMonth() - 2);
        this.endMinDate = this.startDate;
        this.filter.startDate = this.getDate(this.startDate);
        this.filter.endDate = this.getDate(this.endDate);
        this.route.params.subscribe((params) => {
            this.jobId = params['jobId'];
            this.getPipeLine(this.jobId);
            this.getCandidate(this.jobId);
        });
    }


    changeStatus(obj) {
        this.pipelineService.updateApplicantStatus(obj).subscribe((result) => {
            if (result['success']['data']) {
                this.getCandidate(this.jobId);
            }
        });
    }

    changeViewStatus(value) {
        if (this.filter.isGridView !== value) {
            this.filter.isGridView = value;
            this.isGridView = value;
            if (this.isGridView) {
                this.getCandidate(this.jobId);
            }

        }
    }

    updateChildData(filter: any) {
        this.filter.offset = filter.offset || 0;
        this.filter.pageSize = filter.pageSize || 10;
        this.filter.pageIndex = filter.pageIndex || 1;
        this.getCandidate(this.jobId);
    }

    getPipeLine(jobId) {
        if (jobId) {
            this.jobService.getWithApplicantsAndPipelineById(jobId).subscribe((result) => {
                if (result['success']) {
                    this.job = result['success'].data[0];
                    this.pipeLines = result['success'].data[0].pipelines;
                }
            });
        }
    }

    updatePipeLine() {
        this.getPipeLine(this.jobId);
    }

    getCandidate(jobId) {
        if (jobId) {
            this.gettingApplicant = true;
            this.filter.jobId = jobId;
            this.jobService.getJobApplicant(this.filter).subscribe((result) => {
                if (result['success']) {
                    this.filterApplicant(result['success']['data']['records']);
                    this.totalRecords = result['success']['data']['total'];
                }
                this.gettingApplicant = false;
            }, () => {
                this.gettingApplicant = false;
            });
        }
    }

    onDateChange(event, id) {
        if (id === 'startDate') {
            this.filter.startDate = this.getDate(new Date(event));
            this.endMinDate = new Date(event);
            this.startDate = new Date(event);
        } else if (id === 'endDate') {
            this.endDate = new Date(event);
            this.filter.endDate = this.getDate(new Date(event));
            if (this.filter.endDate && this.filter.startDate) {

            }
        }
        this.getCandidate(this.jobId);

    }

    onSourceFilterChange(item) {
        if (item === 'Source') {
            item = '';
        }
        if (this.filter.source !== item) {
            this.filter.source = item;
            this.getCandidate(this.jobId);
        }


    }

    onSearch() {
        this.filter.offset = 0;
        if (this.searchText.length >= 2) {
            this.JobApplicants = [];
            this.totalRecords = 0;
            this.filter.searchText = this.searchText;
            this.getCandidate(this.jobId);
        }
        if (!this.searchText) {
            this.filter.searchText = '';
            this.JobApplicants = [];
            this.totalRecords = 0;
            this.getCandidate(this.jobId);
        }
    }

    filterApplicant(data) {
        this.JobApplicants = [];
        for (let index = 0; index < data.length; index++) {
            data[index]['jobApplicants'] = this.getJobApplicantObject(data[index]['jobApplicants']);
            this.JobApplicants.push(data[index]);
        }
    }

    getJobApplicantObject(data) {
        let object = {};
        for (let index = 0; index < data.length; index++) {
            if (data[index].job === this.jobId) {
                object = data[index];
                break;
            }
        }
        return object;
    }

    getDate(date) {
        const month = date.getMonth() + 1;
        return month + '/' + date.getDate() + '/' + date.getFullYear();
    }

    goToApplicant(data) {
        this.applicantDataService.setApplicantId(data.applicant._id);
        this.router.navigate(['jobs/applicant']);
    }

    addApplicants() {
        if (this.job.pipelines && this.job.pipelines.length > 0) {
            this.router.navigate(['/database/add/job', this.job._id, this.job.pipelines[0]._id]);
        }
    }

    createApplicant(jobId) {
        const initialState = {jobId: jobId, pipelineId: null};
        if (this.job.pipelines && this.job.pipelines.length > 0) {
            initialState.pipelineId = this.job.pipelines[0]._id;
        }
        this.modalRef = this.modalService.show(CreateApplicantComponent, {
            class: 'modal-lg',
            initialState: initialState
        });
        this.modalRef.content.closePopup.subscribe(result => {
            if (result && result['data'] && result['data'].pipeline) {
                const newApplicant = result['data'];
                newApplicant.pipeline = result['data'].pipeline._id;
                newApplicant.applicant.fullName = this.getFullName.bind(result['data'].applicant);
                this.job.applicants.push(newApplicant);
            }
        });
    }

    getFullName(firstName, middleName, lastName) {
        let name = firstName;
        if (middleName && middleName != 'null') name = name + ' ' + middleName;
        if (lastName && lastName != 'null') name = name + ' ' + lastName;
        return name;
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
}
