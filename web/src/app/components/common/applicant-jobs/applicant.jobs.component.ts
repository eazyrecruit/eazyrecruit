import {Component, Input, OnChanges, OnDestroy} from '@angular/core';
import {ConstService} from '../../../services/const.service';
import {Subscription} from "rxjs";



@Component({
    selector: 'app-applicant-jobs',
    templateUrl: 'applicant.jobs.component.html'
})
export class ApplicantJobsComponent implements OnChanges, OnDestroy  {
    @Input()
    applyJobs: any = [];
    time = new Date().getTime();
    color: any = {
        Active: 'badge-success',
        InActivate: 'bg-red-light'
    };
    private _subs: Subscription;
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

    ngOnDestroy(): void {
        if (this._subs) {
            this._subs.unsubscribe();
        }


    }
}
