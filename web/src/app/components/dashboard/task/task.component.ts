import {Component, OnDestroy, OnInit, Output} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {Router, ActivatedRoute} from '@angular/router';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';
import {SharedService} from '../../../services/shared.service';
import {Subscription} from 'rxjs';
import {ApplicantTaskService} from '../../common/applicant-task/applicant.task.service';
import {ConformComponent} from '../../common/conformBox/conform.component';
import {AccountService} from '../../../services/account.service';

declare var SiteJS: any;

@Component({
    templateUrl: 'task.component.html',
    providers: [ApplicantTaskService, BsModalService]
})
export class TaskComponent implements OnInit, OnDestroy {
    timeOut;
    filter = {
        pageIndex: 1, pageSize: 10, offset: 0, sortBy: 'modifiedOn', status: 'ACTIVE',
        order: -1, searchText: '', filter: 'assignee',
    };
    totalRecords = 1;
    gettingTask = false;
    bsConfig = Object.assign({}, {containerClass: 'theme-red'});
    searchText = '';
    filterType = [{displayName: 'Created by me', value: 'created'}, {displayName: 'Assignee to me', value: 'assignee'}];

    private _subs: Subscription;
    TaskList = [];
    sourceColor: any = this.sharedService.getStatusColor();
    modalRef: BsModalRef;
    role: any;
    applicant: any;

    constructor(private fb: FormBuilder,
                private applicantTaskService: ApplicantTaskService,
                private router: Router,
                private accountService: AccountService,
                private activateRoute: ActivatedRoute,
                private modalService: BsModalService,
                private sharedService: SharedService) {
    }

    getSourceColor(source) {
        return this.sourceColor[source] || '';
    }

    onSourceFilterChange(item) {
        if (this.filter.filter !== item) {
            this.filter.filter = item;
            this.TaskList = [];
            this.totalRecords = 0;
            this.getTask();
        }


    }

    updateStatus(id, status, index) {
        const message = status === 'ACTIVE' ? 'Are you want to completed task ' : 'Are you sure want to reopen task';
        this.modalRef = this.modalService.show(ConformComponent, {
            initialState: {
                message: message,
            }
        });
        this.modalRef.content.close = (data) => {
            if (data) {
                this.changeStatus(id, status, index);
            }
            this.modalRef.hide();
        };
    }

    openCandidate(applicantId: any) {
        this.applicant = {_id: applicantId, isApplicantList: true};
        SiteJS.slideOpen('applicant-info');

    }

    changeStatus(id, status, index) {
        this._subs = this.applicantTaskService.updateTask(id, {status: status === 'ACTIVE' ? 'COMPLETED' : 'ACTIVE'}).subscribe(result => {
            if (result['success']) {
                this.TaskList[index]['status'] = status === 'ACTIVE' ? 'COMPLETED' : 'ACTIVE';
                this.getTask();
            }
        });
    }

    onStatusFilterChange(status) {
        if (this.filter.status !== status) {
            this.filter.status = status;
            this.TaskList = [];
            this.totalRecords = 0;
            this.getTask();
        }
    }

    onSort(event) {
        this.filter.offset = 0;
        this.filter.sortBy = event;
        this.filter.order *= -1;
        this.TaskList = [];
        this.totalRecords = 0;
        this.getTask();
    }

    onSearch() {
        if (this.searchText !== this.filter.searchText) {
            if (this.timeOut) {
                clearTimeout(this.timeOut);
            }
            this.timeOut = setTimeout(() => {
                this.filter.offset = 0;
                if (this.searchText.length > 2) {
                    this.TaskList = [];
                    this.totalRecords = 0;
                    this.filter.searchText = this.searchText;
                    this.getTask();
                }
                if (!this.searchText) {
                    this.TaskList = [];
                    this.totalRecords = 0;
                    this.filter.searchText = '';
                    this.totalRecords = 0;
                    this.getTask();
                }
            }, 500);

        }

    }

    ngOnInit() {
        this.gettingTask = true;
        this.getTask();
    }

    getTask() {
        this.applicantTaskService.getAllTask(this.filter).subscribe((result) => {
            if (result['success'] && result['success']['data']) {
                this.TaskList = result['success']['data'].records;
                this.totalRecords = result['success']['data'].total;

            }
            this.gettingTask = false;
        }, () => {
            this.gettingTask = false;
        });
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

    getFullName(firstName, middleName, lastName) {
        let name = firstName;
        if (middleName && middleName != 'null') name = name + ' ' + middleName;
        if (lastName && lastName != 'null') name = name + ' ' + lastName;
        return name;
    }

    onFilterChange(filter: any) {
        this.filter.offset = (filter.pageIndex - 1) * filter.pageSize;
        this.filter.pageSize = filter.pageSize;
        this.filter.pageIndex = filter.pageIndex;
        this.getTask();

    }

    onUpdate($event) {

    }

    ngOnDestroy(): void {
        if (this._subs) {
            this._subs.unsubscribe();
        }
    }
}
