import {Component, OnInit, OnDestroy, Input, Output, EventEmitter} from '@angular/core';
import {SharedService} from '../../../services/shared.service';
import {ApplicantService} from '../../../services/applicant.service';
import {Subscription} from "rxjs";

@Component({
    selector: 'app-applicant-card',
    templateUrl: './applicant.card.component.html',
    providers: [
        ApplicantService
    ]
})
export class ApplicantCardComponent implements OnInit, OnDestroy {

    applicants: any = {};
    selectedPipeline: any;

    @Input()
    applicant?: any;

    @Input()
    pipelines: any;

    @Input()
    pipelineItem: any;

    @Output()
    onSelect: EventEmitter<any> = new EventEmitter();

    @Output()
    changeStatus: EventEmitter<any> = new EventEmitter();

    @Output()
    removeApplicant: EventEmitter<any> = new EventEmitter();
    private _subs: Subscription;

    constructor(private sharedService: SharedService,
                private applicantService: ApplicantService) {
    }

    ngOnInit() {
        this.selectedPipeline = this.applicant.jobApplicants.pipeline;
    }

    getSelectedValue(pipeLine, id) {
        /*//console.log('this.pipeline[pipeLine._id || pipeLine]', this.pipeline[pipeLine._id || pipeLine]);*/
        return pipeLine === id;
    }

    changePipelineStatus(value: any) {
        if (!this.getSelectedValue(this.applicant.jobApplicants.pipeline, value)) {
            this.changeStatus.emit({
                applicant: this.applicant._id,
                jobApplicantId: this.applicant.jobApplicants._id,
                moveToPipeline: value,
                job: this.applicant.jobApplicants.job
            });
        }

    }

    removeUser(jobApplicantId: any) {
        let result =  this._subs = this.applicantService.removeApplicantFromJob(jobApplicantId);
        if (result) {
            this.removeApplicant.emit({isDeleted: true});
        } else {
            this.removeApplicant.emit({isDeleted: false});
        }
    }

    name_clicked(): void {
        this.onSelect.emit(this.applicant);
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

    ngOnDestroy(): void {
        if (this._subs) {
            this._subs.unsubscribe();
        }
    }
}
