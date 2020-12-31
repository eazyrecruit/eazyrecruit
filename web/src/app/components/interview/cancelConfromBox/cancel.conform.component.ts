import {Component, OnInit} from '@angular/core';
import {BsModalRef} from 'ngx-bootstrap';
import {FormBuilder, FormGroup, Validators, FormControl} from '@angular/forms';
import {AccountService, AuthStorage} from '../../../services/account.service';
import {JobService} from '../../../services/job.service';
import {ApplicantDataService} from '../../../services/applicant-data.service';
import {InterviewService} from '../../../services/interview.service';
import {last} from '@angular/router/src/utils/collection';
import {DatePipe} from '@angular/common';
import {ApplicantInfoService} from '../../applicants/applicantInfo/applicant-info.service';

const month = {
    0: 'Jan',
    1: 'Feb',
    2: 'Mar',
    3: 'Apr',
    4: 'May',
    5: 'Jun',
    6: 'Jul',
    7: 'Aug',
    8: 'Sep',
    9: 'Oct',
    10: 'Nov',
    11: 'Dec'
};

@Component({
    selector: 'app-cancel-conform',
    templateUrl: 'cancel.conform.component.html',
    providers: [InterviewService]
})
export class CancelConformComponent implements OnInit {
    conformDeleteForm = false;
    deleteInterViewId;
    close: any;

    constructor(
        public modalRef: BsModalRef,
        private interviewService: InterviewService
    ) {

    }

    deleteInterView() {
        this.conformDeleteForm = true;
        this.interviewService.deleteInterview(this.deleteInterViewId).subscribe(result => {
            if (result['success']) {
                this.close(result['success'].data);
            }
        }, error => {
            this.close();
        });

    }

    ngOnInit(): void {
    }
}
