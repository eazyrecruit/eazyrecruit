import {Component, OnInit, Input, OnChanges} from '@angular/core';
import {Router} from '@angular/router';
import {InterviewService} from '../../../services/interview.service';
import {AccountService} from "../../../services/account.service";
import {SchedulerComponent} from "../scheduler/scheduler.component";
import {CancelConformComponent} from '../cancelConfromBox/cancel.conform.component';
import {BsModalRef, BsModalService} from "ngx-bootstrap";
import {ToasterService} from "angular2-toaster";

@Component({
    selector: 'interview-list',
    templateUrl: './interview.list.component.html',
    providers: [InterviewService]
})
export class InterviewListComponent implements OnInit, OnChanges {

    filter: any;
    interviews = [];
    totalRecords = 0;
    applicant: any;
    role: any;
    modalRef: BsModalRef;

    constructor(private router: Router,
                private toasterService: ToasterService,
                private modalService: BsModalService,
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


    startInterview(interview) {
        if (interview.channel === 'GoLiveMeet') {
            const ael = document.activeElement;
            ael['disabled'] = true;
            ael['innerHTML'] = '<i class="fa fa-spinner fa-spin"></i>';
            this.interviewService.startInterView(interview._id).subscribe(result => {
                ael['disabled'] = false;
                ael['innerHTML'] = '<i class="fas fa-play"></i>Start Interview';
                if (result['success']) {
                    window.open(result['success'].data, '_blank');
                } else {
                    this.toasterService.pop('error', 'Error in schedule interview', result['error'].data);
                }
            }, error => {
                ael['disabled'] = false;
                ael['innerHTML'] = '<i class="fas fa-play"></i>Start Interview';
                this.totalRecords = 0;
            });
        } else {
            window.open(interview.channelLink, '_blank');
        }

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

    openDeleteModel(deleteInterViewId) {
        this.modalRef = this.modalService.show(CancelConformComponent, {
            initialState: {
                deleteInterViewId: deleteInterViewId,
            }
        });
        this.modalRef.content.close = (data) => {
            if (data) {
                this.getAllInterviews(this.filter);
            }
            this.modalRef.hide();
        };
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
        } else if (type && type === 'CANCEL') {
            this.filter.type = 'CANCEL'
            this.filter.sortOrder = 1;
        } else {
            this.filter.type = 'PENDING'
            this.filter.sortOrder = 1;
        }
        this.getAllInterviews(this.filter);
    }


}
