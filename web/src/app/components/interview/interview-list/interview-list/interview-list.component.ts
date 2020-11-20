import {Component, OnInit, Input, OnChanges} from '@angular/core';
import {Router} from '@angular/router';
import {InterviewService} from '../../../../services/interview.service';
import {AccountService} from "../../../../services/account.service";

@Component({
    selector: 'interview-list',
    templateUrl: './interview-list.component.html',
    styleUrls: ['./interview-list.component.css'],
    providers: [InterviewService]
})
export class InterviewListComponent implements OnInit, OnChanges {

    filter: any;
    interviews = [];
    totalRecords = 0;
    applicant: any;
    deleteInterViewId;
    conformDeleteForm = false;
    role: any;
    constructor(private router: Router,
                private interviewService: InterviewService, private accountService: AccountService) {
    }

    ngOnChanges(): void {
    }

    ngOnInit() {
        this.role = this.accountService.getRole();
        this.filter = {
            pageIndex: 1,
            pageSize: 10,
            searchText: '',
            sortField: 'name',
            sortOrder: '1',
            offset: 0,
            type: 'PENDING'
        };
        this.onFilterChange(this.filter);
    }

    openInterviewPage(id) {
        this.router.navigate([`interview/${id}`]);
    }

    onFilterChange(filter: any) {
        this.filter.offset = (filter.pageIndex - 1) * filter.pageSize;
        this.filter.searchText = filter.searchText;
        this.filter.pageSize = filter.pageSize;
        this.filter.pageIndex = filter.pageIndex;
        this.filter.sortOrder = filter.sortOrder;
        this.filter.type = filter.type ? filter.type : this.filter.type;
        this.getAllInterviews(this.filter);
    }

    getAllInterviews(filter: any) {
        this.interviewService.getAllInterviews(filter).subscribe(result => {
            if (result['success']) {
                if (result['success']['data'] && result['success']['data']['count']) {
                    this.interviews = result['success']['data']['interviews'];
                    this.totalRecords = result['success']['data']['count'];
                } else {
                    this.interviews.length = 0;
                    this.totalRecords = 0;
                }
            } else {
                this.totalRecords = 0;
            }
        }, error => {
            this.totalRecords = 0;
        });
    }

    getLocalDate(date: any): String {
        return new Date(date).toLocaleString();
    }

    getFullName(firstName, middleName, lastName) {
        var name = firstName;
        if (middleName && middleName != "null") name = name + " " + middleName;
        if (lastName && lastName != "null") name = name + " " + lastName;
        return name;
    }

    changeType(type: String) {
        if (type && type === 'COMPLETED') {
            this.filter.type = 'COMPLETED'
            this.filter.sortOrder = -1;
        } else {
            this.filter.type = 'PENDING'
            this.filter.sortOrder = 1;
        }
        this.getAllInterviews(this.filter);
    }

    closeDeleteModel() {
        this.deleteInterViewId = '';
        this.conformDeleteForm = false;
        document.getElementById('deleteCancel').click(); // for model close
    }

    deleteInterView() {
        this.conformDeleteForm = true;
        this.interviewService.deleteInterview(this.deleteInterViewId).subscribe(result => {
            if (result['success']) {
                this.getAllInterviews(this.filter);
                this.closeDeleteModel();
            }
        }, error => {
            this.closeDeleteModel();
        });

    }

    openDeleteModel(deleteInterViewId) {
        this.deleteInterViewId = deleteInterViewId;
    }


}
