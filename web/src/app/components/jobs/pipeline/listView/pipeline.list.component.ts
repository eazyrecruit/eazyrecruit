import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {Router, Params, ActivatedRoute} from '@angular/router';
import {ToasterService} from 'angular2-toaster';
import {ValidationService} from '../../../../services/validation.service';
import {AccountService} from '../../../../services/account.service';
import {ConstService} from '../../../../services/const.service';
import {PipelineService} from '../../../../services/pipeline.service';
import {SharedService} from '../../../../services/shared.service';
import {DataShareService} from '../../../../services/data-share.service';
import {ApplicantDataService} from '../../../../services/applicant-data.service';
import {JobService} from '../../../../services/job.service';
import {BsModalService} from 'ngx-bootstrap';

declare var SiteJS: any;

@Component({
    selector: 'app-pipieline-list',
    templateUrl: 'pipeline.list.component.html',
    providers: [PipelineService, SharedService, ValidationService, JobService]
})
export class PipelineListComponent implements OnChanges {
    @Input('jobId') jobId: any;
    @Input('pipeLines') pipeLines: any;
    @Input('JobApplicants') JobApplicants: any;
    @Input('totalRecords') totalRecords: any;
    @Input('filter') filter: any;
    Applicants: any;
    @Output()
    changeFilter: EventEmitter<any> = new EventEmitter();
    selectedApplicant: any;

    @Output()
    onChangeStatus: EventEmitter<any> = new EventEmitter();

    constructor(private route: ActivatedRoute,
                private pipelineService: PipelineService,
                private sharedService: SharedService,
                private fb: FormBuilder,
                private dataShared: DataShareService,
                private router: Router,
                private validationService: ValidationService,
                private applicantDataService: ApplicantDataService,
                private jobService: JobService) {
    }

    onChangeItemStatusFilter(pipelineId, applicant) {
        console.log('onChangeItemStatusFilteritem', pipelineId);
        console.log('onChangeItemStatusFilter_id', applicant);
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
        this.Applicants = this.JobApplicants;
    }

    getPipeLine(jobId) {
        if (jobId) {
            this.jobService.getJobPipeLine(jobId).subscribe(result => {
                if (result['success']) {
                    this.pipeLines = result['success'].data.pipelines;
                    console.log(' this.pipeLines', this.pipeLines);
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

    showApplicantDetails(applicant: any) {
        this.selectedApplicant = applicant;
        console.log('applicant', applicant);
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
        this.filter.pageIndex = filter.pageIndex;
        this.changeFilter.emit(this.filter);
    }

    updateJobApplicantList() {
        this.changeFilter.emit(this.filter);
    }

    onUpdate($event) {
        console.log('$event', $event);
        this.changeFilter.emit(this.filter);
    }
}
