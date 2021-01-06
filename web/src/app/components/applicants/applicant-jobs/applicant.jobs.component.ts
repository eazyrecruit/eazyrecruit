import {Component, Input, OnChanges} from '@angular/core';
import {ConstService} from '../../../services/const.service';
import {el} from "@angular/platform-browser/testing/src/browser_util";


@Component({
    selector: 'app-applicant-jobs',
    templateUrl: 'applicant.jobs.component.html'
})
export class ApplicantJobsComponent implements OnChanges {
    @Input()
    applyJobs: any = [];
    time = new Date().getTime();
    color: any = {
        Active: 'badge-success',
        InActivate: 'bg-red-light'
    };

    constructor(private constService: ConstService) {
    }

    getImageData(id) {
        return this.constService.publicUrl + '/api/user/profile/' + id + '?' + this.time;
    }

    ngOnChanges() {
    }

    getStatus(data) {
        if (data.is_deleted) {
            return 'InActivate';
        } else if (data.active) {
            return 'Active';
        } else {
            return 'InActivate';
        }
    }


}
