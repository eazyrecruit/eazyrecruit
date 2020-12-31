import {Component, Input, OnChanges} from '@angular/core';


@Component({
    selector: 'app-applicant-jobs',
    templateUrl: 'applicant.jobs.component.html'
})
export class ApplicantJobsComponent implements OnChanges {
    @Input()
    applyJobs: any = [];

    constructor() {
    }

    ngOnChanges() {
    }


}
