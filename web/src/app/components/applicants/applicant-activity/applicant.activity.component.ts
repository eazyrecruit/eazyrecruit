import {Component, OnInit, Input, OnChanges} from '@angular/core';
import {ApplicantActivityService} from './applicant-activity.service';
import {ActivatedRoute, Params} from '@angular/router';
import {ConstService} from '../../../services/const.service';

@Component({
    selector: 'applicant-activity',
    templateUrl: 'applicant.activity.component.html',
    providers: [ApplicantActivityService]
})
export class ApplicantActivityComponent implements OnChanges {
    @Input()
    applicantId: any;

    @Input()
    isActivityUpdate: boolean;
    isLoading = false;
    activityData: any = [];
    time = new Date().getTime();

    constructor(
        private route: ActivatedRoute,
        private constService: ConstService,
        private applicantActivityService: ApplicantActivityService
    ) {
    }

    getApplicantActivity() {
        this.time = new Date().getTime();
        this.isLoading = true;
        this.applicantActivityService.getActivity(this.applicantId).subscribe(result => {
            console.log('result', result);
            if (result['success'] && result['success'].data && result['success'].data.records && result['success'].data.records.length) {
                this.activityData = result['success'].data.records;
                console.log('ActivityData', this.activityData);
            }
            this.isLoading = false;
        }, () => {
            this.isLoading = false;
        });
    }


    getImageData(id) {
        return this.constService.publicUrl + '/api/user/profile/' + id + '?' + this.time;
    }

    ngOnChanges(): void {
        console.log('getApplicantActivity');
        this.getApplicantActivity();
    }
}
