import {Component, OnInit, OnDestroy, Input, OnChanges} from '@angular/core';
import {ApplicantTaskService} from './applicant.task.service';
import {ActivatedRoute, Params} from '@angular/router';
import {ConstService} from '../../../services/const.service';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';
import {AddTaskComponent} from './add-task/add.task.component';
import {ToasterService} from 'angular2-toaster';
import {Subscription} from "rxjs";

@Component({
    selector: 'app-applicant-task',
    templateUrl: 'applicant.task.component.html',
    providers: [ApplicantTaskService]
})
export class ApplicantTaskComponent implements OnChanges, OnDestroy {
    @Input()
    applicantId?: any;
    isLoading = false;
    taskData: any = [];
    time = new Date().getTime();
    modalRef: BsModalRef;
    private _subs: Subscription;

    constructor(
        private route: ActivatedRoute,
        private constService: ConstService,
        private modalService: BsModalService,
        private toasterService: ToasterService,
        private applicantActivityService: ApplicantTaskService
    ) {
    }

    addTask() {
        this.modalRef = this.modalService.show(AddTaskComponent, {
            class: 'modal-md',
            initialState: {applicant: this.applicantId, isEdit: false}
        });
        this.modalRef.content.closePopup.subscribe(result => {
            if (result) {
                this.toasterService.pop('success', 'Task Created', 'Task Created successfully');
                this.getTask();
            }
        });
    }

    getTask() {
        this.time = new Date().getTime();
        this.isLoading = true;
        this._subs = this.applicantActivityService.getTask(this.applicantId).subscribe(result => {
            if (result['success'] && result['success'].data && result['success'].data.records && result['success'].data.records.length) {
                this.taskData = result['success'].data.records;
            }
            this.isLoading = false;
        }, () => {
            this.isLoading = false;
        });
    }

    onUpdate(data) {
    }


    getImageData(id) {
        return this.constService.publicUrl + '/api/user/profile/' + id + '?' + this.time;
    }

    ngOnChanges(): void {
        this.getTask();
    }

    ngOnDestroy(): void {
        if (this._subs) {
            this._subs.unsubscribe();
        }
    }
}
