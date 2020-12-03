import {Component, EventEmitter, Input, OnChanges, OnInit, Output, TemplateRef} from '@angular/core';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {Router, Params, ActivatedRoute} from '@angular/router';
import {ValidationService} from '../../../../services/validation.service';
import {PipelineService} from '../../../../services/pipeline.service';
import {SharedService} from '../../../../services/shared.service';
import {JobService} from '../../../../services/job.service';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';
import {DataShareService} from '../../../../services/data-share.service';
import {ApplicantDataService} from '../../../../services/applicant-data.service';
import {CreateApplicantComponent} from '../../../applicants/create-applicant/create-applicant.component';

declare var SiteJS: any;

@Component({
    selector: 'app-pipieline-grid',
    templateUrl: 'pipeline.grid.component.html',
    providers: [PipelineService, SharedService, ValidationService, JobService]
})
export class PipelineGridComponent implements OnChanges {
    @Input('jobId') jobId: any;
    @Input('pipeLines') pipeLines: any;
    @Input('JobApplicants') JobApplicants: any;
    job: any;
    Applicants: any;
    pipeLinesApplicant: any = {};
    @Output()
    changeFilter: EventEmitter<any> = new EventEmitter();
    @Output()
    onChangeStatus: EventEmitter<any> = new EventEmitter();
    @Output()
    getPipeLine: EventEmitter<any> = new EventEmitter();
    jobApplicantIds = {};
    items = [];
    selectedApplicant: any;
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

    setPipeLinesApplicant() {
        this.pipeLinesApplicant = {};
        for (let index = 0; index < this.Applicants.length; index++) {
            if (this.pipeLinesApplicant.hasOwnProperty(this.Applicants[index].jobApplicants.pipeline)) {
                this.pipeLinesApplicant[this.Applicants[index].jobApplicants.pipeline].push(this.Applicants[index]);
            } else {
                this.pipeLinesApplicant[this.Applicants[index].jobApplicants.pipeline] = [this.Applicants[index]];
            }

        }
    }


    setApplicantPipeLineDetails(applicant, pipeLine) {
        applicant['pipeline'] = pipeLine;
        return applicant;
    }

    getSelectedValue(pipeLine, id) {
        /*//console.log('this.pipeline[pipeLine._id || pipeLine]', this.pipeline[pipeLine._id || pipeLine]);*/
        return pipeLine === id || pipeLine._id === id;
    }

    onItemDrop(event: any, pipeline: any) {
        if (!this.getSelectedValue(event.dragData.jobApplicants.pipeline, pipeline._id)) {
            const obj = {
                dragData: {
                    pipeline: pipeline._id,
                    applicant: event.dragData._id,
                    job: event.dragData.jobApplicants.job,
                    id: event.dragData.jobApplicants._id  // job pipelineId
                }
            };
            this.changeStatus(event);
        }
    }

    showApplicantDetails(applicant: any) {
        this.selectedApplicant = applicant;
        SiteJS.slideOpen('applicant-info-pipeline');
    }

    ngOnChanges(): void {
        this.Applicants = this.JobApplicants;
        this.setPipeLinesApplicant();
    }

    saveData(id) {
        this.items.forEach(element => {
            if (element.id === id) {
                this.sharedService.setApplicantDetail(JSON.stringify(element));
            }
        });
    }

    getPipeLineList() {
        this.changeFilter.emit({});
    }

    changeStatus(obj) {
        const applicant: any = {};
        applicant.applicant = obj.dragData.applicant;
        applicant.pipeline = obj.dragData.pipeline;
        applicant.job = obj.dragData.job;
        applicant.id = obj.dragData.id;
        this.onChangeStatus.emit(applicant);
    }

    eventHandler(event: any) {
        if (event.applicant) {
            this.showApplicantDetails(event);
        } else {
            this.closeAndRefresh();
        }
    }

    onCandidateReject(event: any) {
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

    onColumnDrop(event, item, index) {
        if (event && item && event.dragData.jobApplicants.pipeline !== item._id) {
            const obj = {
                dragData: {
                    pipeline: item._id,
                    applicant: event.dragData._id,
                    job: event.dragData.jobApplicants.job,
                    id: event.dragData.jobApplicants._id
                }
            };

            this.changeStatus(obj);
        }
    }

    onColumnDrag(event, item, i) {
        this.draggedItem = item;
        this.start = i;
    }


    addPipeline(form): void {
        if (this.pipeLines && this.pipeLines.find(x => x.name.toUpperCase().trim() === form.name.toUpperCase().trim())) {
            return;
        }
        form.position = this.pipeLines ? this.pipeLines.length + 1 : 1;
        form.jobPostId = this.jobId;
        this.jobService.addPipeline(form, this.jobId).subscribe(result => {
            if (result['success']) {
                this.closeModal();
                this.getPipeLine.emit({});
            }
        });
    }


    editPipeline(pipeline) {
        this.pipelineService.updatePipelineDetails(pipeline).subscribe(result => {
            if (result['success'] && result['success'].data) {
                this.closeModal();
                this.getPipeLine.emit({});
            } else {
                this.closeModal();
            }
        }, () => {
            this.closeModal();
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
            if (pipeline && pipeline._id) {
                this.editPipeline(pipeline);
            } else {
                this.pipelineDialogTitle = 'Create';
                this.addPipeline(pipeline);
            }
        }
    }

    populateForm(pipeline, index = 0) {
        if (pipeline && pipeline._id) {
            this.form = this.fb.group({
                name: [pipeline.name, [<any>Validators.required]],
                _id: [pipeline._id],
                index: index
            });
        } else {
            this.form = this.fb.group({
                name: ['', [<any>Validators.required]]
            });
        }
    }

    setpipelineId(pipeline: any, index: any) {
        this.pipeline = pipeline;
        if (!this.pipeline) {
            this.pipelineDialogTitle = 'Create';
            this.form.reset();
        } else {
            this.pipelineDialogTitle = 'Edit';
            this.populateForm(pipeline, index);
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


    deletePipeline(template: TemplateRef<any>) {
        this.modalRef = this.modalService.show(template, {class: 'modal-sm'});
    }

    confirm(pipelineId, index): void {
        this.pipelineService.deletePipeline(pipelineId).subscribe(result => {
            if (result['success']) {
                this.modalRef.hide();
                this.getPipeLine.emit({});
            }
        });
    }

    decline(): void {
        this.modalRef.hide();
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

    updateJobApplicantList(deleteResponse: any, index) {
        this.getPipeLineList();
    }

    onUpdate($event) {
           this.getPipeLineList();
    }
}
