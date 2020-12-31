import {Component, OnInit, Input} from '@angular/core';
import {CompanyService} from '../../../../services/company.service';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {ValidationService} from '../../../../services/validation.service';
import {BsModalRef} from 'ngx-bootstrap';
import {Subject} from 'rxjs';
import {ApplicantTaskService} from '../applicant.task.service';

@Component({
    selector: 'app-add-task',
    templateUrl: 'add.task.component.html',
    providers: [ApplicantTaskService, ValidationService]
})
export class AddTaskComponent implements OnInit {

    addTaskForm: FormGroup;
    closePopup: Subject<any>;
    endMinDate: any = new Date();
    @Input('applicant')
    applicant;
    @Input('isEdit')
    isEdit;
    @Input('taskData')
    taskData;
    userList: any[] = [];
    bsConfig = Object.assign({}, {containerClass: 'theme-red'});

    constructor(private applicantTaskService: ApplicantTaskService,
                private fbForm: FormBuilder,
                private validationService: ValidationService,
                private bsModelRef: BsModalRef) {
        this.addTaskForm = this.fbForm.group({
            id: [null],
            title: ['', [<any>Validators.required]],
            description: ['', [<any>Validators.required]],
            assignee: ['', [<any>Validators.required]],
            applicant: [this.applicant],
            targetDate: [new Date(), [<any>Validators.required]]
        });
    }

    ngOnInit() {
        this.closePopup = new Subject<any>();
        this.addTaskForm.get('applicant').setValue(this.applicant);
        if (this.isEdit) {
            this.addTaskForm.get('id').setValue(this.taskData.id);
            this.addTaskForm.get('title').setValue(this.taskData.title);
            this.addTaskForm.get('description').setValue(this.taskData.description);
            this.addTaskForm.get('assignee').setValue(this.taskData.assignee);
            this.addTaskForm.get('applicant').setValue(this.applicant);
            if (this.taskData.targetDate) {
                this.addTaskForm.get('targetDate').setValue(new Date(this.taskData.targetDate));
            }
        }
        this.getUser();
    }

    getUser() {
        this.applicantTaskService.getAllUsers().subscribe(result => {
            if (result['success'] && result['success'].data && result['success'].data.users && result['success'].data.users.length) {
                this.userList = result['success'].data.users;
                console.log('ActivityData', this.userList);
            }
        });
    }

    createTask(form) {
        console.log('Form', form);
        if (!this.addTaskForm.valid) {
            this.validationService.validateAllFormFields(this.addTaskForm);
        } else {
            this.applicantTaskService.createTask(form).subscribe(result => {
                if (result['success'] && result['success']['data']) {
                    // emit updated data and close model
                    this.closePopup.next(result['success']['data']);
                    this.bsModelRef.hide();
                }
            });
        }
    }

}
