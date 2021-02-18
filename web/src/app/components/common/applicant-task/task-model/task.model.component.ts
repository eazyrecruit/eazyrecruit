import {Component, OnInit, OnDestroy, Input, OnChanges} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';
import {ToasterService} from 'angular2-toaster';
import {Subscription} from 'rxjs';
import {ApplicantTaskService} from '../applicant.task.service';
import {ConstService} from '../../../../services/const.service';
import {ConformComponent} from '../../conformBox/conform.component';
import {AddTaskComponent} from '../add-task/add.task.component';

@Component({
    selector: 'app-task-model',
    templateUrl: 'task.model.component.html',
    providers: [ApplicantTaskService]
})
export class TaskModelComponent implements OnChanges, OnDestroy {
    @Input()
    taskData?: any;
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

    updateStatus(id, status) {
        const message = status === 'ACTIVE' ? 'Are you want to completed task ' : 'Are you sure want to reopen task';
        this.modalRef = this.modalService.show(ConformComponent, {
            initialState: {
                message: message,
            }
        });
        this.modalRef.content.close = (data) => {
            if (data) {
                this.changeStatus(id, status);
            }
            this.modalRef.hide();
        };
    }

    editTask(data) {
        this.modalRef = this.modalService.show(AddTaskComponent, {
            class: 'modal-md',
            initialState: {
                applicant: data.applicant._id || data.applicant, isEdit: true,
                taskData: {
                    id: data._id,
                    assignee: data.assignee._id,
                    title: data.title,
                    description: data.description,
                    applicant: data.applicant._id || data.applicant,
                    targetDate: data.targetDate

                }
            }
        });
        this.modalRef.content.closePopup.subscribe(result => {
            if (result) {
                this.toasterService.pop('success', 'Task Updated', 'Task Created successfully');
            }
        });
    }

    changeStatus(id, status) {
        this._subs = this.applicantActivityService.updateTask(id,
            {status: status === 'ACTIVE' ? 'COMPLETED' : 'ACTIVE'}).subscribe(result => {
            if (result['success']) {
            }
        });
    }


    getImageData(id) {
        return this.constService.publicUrl + '/api/user/profile/' + id + '?' + this.time;
    }

    ngOnChanges(): void {
    }

    ngOnDestroy(): void {
        if (this._subs) {
            this._subs.unsubscribe();
        }
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
}
