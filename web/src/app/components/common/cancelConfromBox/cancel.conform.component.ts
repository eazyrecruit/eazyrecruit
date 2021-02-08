import {Component, OnInit, OnDestroy } from '@angular/core';
import {BsModalRef} from 'ngx-bootstrap';
import {InterviewService} from '../../../services/interview.service';
import {Subscription} from "rxjs";

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
export class CancelConformComponent implements OnInit, OnDestroy {
    conformDeleteForm = false;
    deleteInterViewId;
    close: any;
    private _subs: Subscription;
    constructor(
        public modalRef: BsModalRef,
        private interviewService: InterviewService
    ) {

    }

    deleteInterView() {
        this.conformDeleteForm = true;
        this._subs = this.interviewService.deleteInterview(this.deleteInterViewId).subscribe(result => {
            if (result['success']) {
                this.close(result['success'].data);
            }
        }, error => {
            this.close();
        });

    }

    ngOnInit(): void {
    }

    ngOnDestroy(): void {
        if (this._subs) {
            this._subs.unsubscribe();
        }
    }
}
