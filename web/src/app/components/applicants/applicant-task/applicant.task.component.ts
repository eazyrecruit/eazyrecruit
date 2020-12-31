import {Component, OnInit, Input, OnChanges} from '@angular/core';
import {ApplicantTaskService} from './applicant.task.service';
import {ActivatedRoute, Params} from '@angular/router';
import {ConstService} from '../../../services/const.service';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';
import {AddTaskComponent} from './add-task/add.task.component';
import {ToasterService} from 'angular2-toaster';

@Component({
    selector: 'app-applicant-task',
    templateUrl: 'applicant.task.component.html',
    providers: [ApplicantTaskService]
})
export class ApplicantTaskComponent implements OnChanges {
    @Input()
    applicantId?: any;
    isLoading = false;
    taskData: any = [];
    time = new Date().getTime();
    modalRef: BsModalRef;

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

    editTask(data) {
        this.modalRef = this.modalService.show(AddTaskComponent, {
            class: 'modal-md',
            initialState: {
                applicant: this.applicantId, isEdit: true,
                taskData: {
                    id: data._id,
                    assignee: data.assignee._id,
                    title: data.title,
                    description: data.description,
                    applicant: data.applicant,
                    targetDate: data.targetDate

                }
            }
        });
        this.modalRef.content.closePopup.subscribe(result => {
            if (result) {
                this.toasterService.pop('success', 'Task Updated', 'Task Created successfully');
                this.getTask();
            }
        });
    }

    getTask() {
        this.time = new Date().getTime();
        this.isLoading = true;
        this.applicantActivityService.getTask(this.applicantId).subscribe(result => {
            console.log('result', result);
            if (result['success'] && result['success'].data && result['success'].data.records && result['success'].data.records.length) {
                this.taskData = result['success'].data.records;
                console.log('ActivityData', this.taskData);
            }
            this.isLoading = false;
        }, () => {
            this.isLoading = false;
        });
    }

    changeStatus(id, status) {
        this.applicantActivityService.updateTask(id, {status: status === 'ACTIVE' ? 'COMPLETED' : 'ACTIVE'}).subscribe(result => {
            console.log('result', result);
            if (result['success']) {
                this.getTask();
            }
        });
    }


    getImageData(id) {
        return this.constService.publicUrl + '/api/user/profile/' + id + '?' + this.time;
    }

    ngOnChanges(): void {
        console.log('getApplicantActivity');
        this.getTask();
    }
}
