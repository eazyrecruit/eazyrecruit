import {Component, EventEmitter, Input, OnChanges, OnDestroy, Output} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {Router, Params, ActivatedRoute} from '@angular/router';
import {ValidationService} from '../../../../../services/validation.service';
import {PipelineService} from '../../../../../services/pipeline.service';
import {SharedService} from '../../../../../services/shared.service';
import {DataShareService} from '../../../../../services/data-share.service';
import {ApplicantDataService} from '../../../../../services/applicant-data.service';
import {JobService} from '../../../../../services/job.service';
import {ApplicantService} from '../../../../../services/applicant.service';
import {Subscription} from "rxjs";

declare var SiteJS: any;

@Component({
    selector: 'app-pipieline-list',
    templateUrl: 'pipeline.list.component.html',
    providers: [PipelineService, SharedService, ValidationService, JobService, ApplicantService]
})
export class PipelineListComponent implements OnChanges, OnDestroy {
    @Input('jobId') jobId: any;
    @Input('pipeLines') pipeLines: any;
    @Input('filter') filter: any;
    JobApplicants: any;
    totalRecords: any;
    pipeLineName = {};
    Applicants: any;
    selectedApplicant: any;
    colorClass: any = this.sharedService.getPipeLineColor();
    sourceColor: any = this.sharedService.getSourceColor();
    gettingApplicant = true;
    @Output()
    onChangeStatus: EventEmitter<any> = new EventEmitter();
    private _subs: Subscription;

    constructor(private route: ActivatedRoute,
                private pipelineService: PipelineService,
                private sharedService: SharedService,
                private fb: FormBuilder,
                private dataShared: DataShareService,
                private router: Router,
                private applicantService: ApplicantService,
                private validationService: ValidationService,
                private applicantDataService: ApplicantDataService,
                private jobService: JobService) {
    }

    onChangeItemStatusFilter(pipelineId, applicant) {
        if (!this.getSelectedValue(applicant.jobApplicants.pipeline, pipelineId)) {
            this.changeApplicantStatus({
                applicant: applicant._id,
                jobApplicantId: applicant.jobApplicants._id,
                moveToPipeline: pipelineId,
                job: applicant.jobApplicants.job
            });
        }
    }

    ngOnChanges(): void {
        this.getCandidate(this.jobId);
        for (let index = 0; index < this.pipeLines.length; index++) {
            this.pipeLineName[this.pipeLines[index]._id] = this.pipeLines[index].name.toLowerCase();
        }
    }

    getPipeLine(jobId) {
        if (jobId) {
             this._subs = this.jobService.getWithApplicantsAndPipelineById(jobId).subscribe(result => {
                if (result['success']) {
                    this.pipeLines = result['success'].data[0].pipelines;
                }
            });
        }
    }

    getName(applicant) {
        let name = '';
        if (applicant.firstName) {
            name = name + ' ' + applicant.firstName;
        }
        if (applicant.middleName) {
            name = name + ' ' + applicant.middleName;
        }
        if (applicant.lastName) {
            name = name + ' ' + applicant.lastName;
        }

        return name;
    }

    getSelectedValue(pipeLine, id) {
        return pipeLine === id;
    }

    getSourceColor(source) {
        return this.sourceColor[source] || '';
    }

    getSelectedColor(id) {
        return this.colorClass[this.pipeLineName[id]] || '';
    }

    getSelectedColor1(name) {
        return this.colorClass[name] || '';
    }

    showApplicantDetails(applicant: any) {
        this.selectedApplicant = applicant;
        SiteJS.slideOpen('applicant-info-pipeline');
    }

    changeApplicantStatus(applicant: any) {
        const obj = {
            dragData: {
                pipeline: applicant.moveToPipeline,
                applicant: applicant.applicant,
                job: applicant.job,
                id: applicant.jobApplicantId  // job pipelineId
            }
        };
        this.changeStatus(obj);
    }

    removeUser(jobApplicantId: any) {
         this._subs = this.applicantService.removeApplicantFromJob(jobApplicantId);
        this.getCandidate(this.jobId);
    }

    changeStatus(obj) {
        const applicant: any = {};
        applicant.applicant = obj.dragData.applicant;
        applicant.pipeline = obj.dragData.pipeline;
        applicant.job = obj.dragData.job;
        applicant.id = obj.dragData.id;
        this.onChangeStatus.emit(applicant);
    }

    onFilterChange(filter) {
        this.filter.offset = (filter.pageIndex - 1) * filter.pageSize;
        this.filter.pageSize = filter.pageSize;
        this.getCandidate(this.jobId);
    }

    updateJobApplicantList() {
        this.getCandidate(this.jobId);
    }

    onUpdate($event) {
        this.getCandidate(this.jobId);
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

    filterApplicant(data) {
        this.JobApplicants = [];
        for (let index = 0; index < data.length; index++) {
            const jobApplicants = data[index];
            const applicant = Object.assign({}, jobApplicants.Applicants);
            applicant['created_at'] = jobApplicants['created_at'];
            applicant['modified_at'] = jobApplicants['modified_at'];
            applicant['jobApplicants'] = {
                _id: jobApplicants._id,
                job: jobApplicants.job,
                pipeline: jobApplicants.pipeline,
            };
            this.JobApplicants.push(applicant);
        }
        this.Applicants = this.JobApplicants;
    }

    getCandidate(jobId) {
        if (jobId) {
            this.gettingApplicant = true;
            this.filter.jobId = jobId;
             this._subs = this.jobService.getJobApplicant(this.filter).subscribe((result) => {
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

    ngOnDestroy(): void {
        if (this._subs) {
            this._subs.unsubscribe();
        }
    }
}
