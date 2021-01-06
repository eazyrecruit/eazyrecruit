import {Component, OnInit, Input, OnChanges} from '@angular/core';
import {ApplicantActivityService} from './applicant-activity.service';
import {ActivatedRoute, Params} from '@angular/router';
import {ConstService} from '../../../services/const.service';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';
import {ToasterService} from 'angular2-toaster';
import {AddActivityComponent} from './add-activity/add.activity.component';

@Component({
    selector: 'app-applicant-activity',
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
    modalRef: BsModalRef;

    constructor(
        private route: ActivatedRoute,
        private constService: ConstService,
        private modalService: BsModalService,
        private toasterService: ToasterService,
        private applicantActivityService: ApplicantActivityService
    ) {
    }

    getApplicantActivity() {
        this.time = new Date().getTime();
        this.isLoading = true;
        this.applicantActivityService.getActivity(this.applicantId).subscribe(result => {

            if (result['success'] && result['success'].data && result['success'].data.records && result['success'].data.records.length) {
                this.activityData = result['success'].data.records;
            }
            this.isLoading = false;
        }, () => {
            this.isLoading = false;
        });
    }

    createActivity() {
        this.modalRef = this.modalService.show(AddActivityComponent, {
            class: 'modal-md',
            initialState: {applicant: this.applicantId}
        });
        this.modalRef.content.closePopup.subscribe(result => {
            if (result) {
                this.toasterService.pop('success', 'Activity Created', 'Activity Created successfully');
                this.getApplicantActivity();
            }
        });
    }

    getImageData(id) {
        return this.constService.publicUrl + '/api/user/profile/' + id + '?' + this.time;
    }

    ngOnChanges(): void {
        this.getApplicantActivity();
    }
}
