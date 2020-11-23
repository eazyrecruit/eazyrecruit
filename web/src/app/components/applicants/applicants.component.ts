import {Component, OnInit} from '@angular/core';
import {SearchService} from '../../services/search.service';
import {JobService} from '../../services/job.service';

@Component({
    selector: 'app-applicants',
    templateUrl: './applicants.component.html',
    providers: [SearchService, JobService]
})
export class ApplicantsComponent implements OnInit {
    filter = {
        pageIndex: 1, pageSize: 10, offset: 0, sortBy: 'modified_at', isGridView: false,
        order: -1, searchText: '', startDate: '', endDate: '', source: '', jobId: '',
    };
    totalRecords = 1;
    jobs: any = [];
    jobIds: any = {};
    bsConfig = Object.assign({}, {containerClass: 'theme-red'});
    searchText = '';
    sourceType = ['Email', 'Upload', 'Website', 'Db'];
    startDate: any = new Date();
    endDate: any = new Date();
    startMaxDate: any = new Date();
    endMinDate: any = new Date();
    endMaxDate: any = new Date();
    ApplicantList: any = [];
    applicant: any;
    dataTableName = 'applicant';
    gettingApplicant = false;

    constructor(private searchService: SearchService,
                private jobService: JobService) {

    }

    getJobsName() {
        this.jobService.getJobsName().subscribe(result => {
            if (result['success']) {
                this.jobs = result['success']['data'];
                for (let index = 0; index < this.jobs.length; index++) {
                    this.jobIds[this.jobs[index]._id] = this.jobs[index].title;
                }
                console.log('this.jobIds', this.jobIds);
            }
        });
    }

    ngOnInit() {
        this.getJobsName();
        this.startDate.setMonth(new Date().getMonth() - 2);
        this.endMinDate = this.startDate;
        this.filter.startDate = this.getDate(this.startDate);
        this.filter.endDate = this.getDate(this.endDate);
        this.getCandidate();

    }

    onDateChange(event, id) {
        if (id === 'startDate') {
            this.filter.startDate = this.getDate(new Date(event));
            this.endMinDate = new Date(event);
            this.startDate = new Date(event);
        } else if (id === 'endDate') {
            this.endDate = new Date(event);
            this.filter.endDate = this.getDate(new Date(event));
            if (this.filter.endDate && this.filter.startDate) {
                console.log('event', event);

            }
        }
        this.ApplicantList = [];
        this.totalRecords = 0;
        this.getCandidate();

    }

    onJoBSubmit(item) {
        if (this.filter.jobId !== item) {
            this.filter.jobId = item;
            this.ApplicantList = [];
            this.totalRecords = 0;
            this.getCandidate();
        }


    }

    onSourceFilterChange(item) {
        console.log('onSourceFilterChange1', item);
        if (item === 'Source') {
            item = '';
        }
        if (this.filter.source !== item) {
            this.filter.source = item;
            this.ApplicantList = [];
            this.totalRecords = 0;
            this.getCandidate();
        }


    }

    onSort(event) {
        this.filter.offset = 0;
        this.filter.sortBy = event;
        this.filter.order *= -1;
        this.ApplicantList = [];
        this.totalRecords = 0;
        this.getCandidate();
    }

    onSearch() {
        console.log('onSearch');
        if (this.searchText !== this.filter.searchText) {
            this.filter.offset = 0;
            if (this.searchText.length > 2) {
                this.ApplicantList = [];
                this.totalRecords = 0;
                this.filter.searchText = this.searchText;
                this.getCandidate();
            }
            if (!this.searchText) {
                this.ApplicantList = [];
                this.totalRecords = 0;
                this.filter.searchText = '';
                this.totalRecords = 0;
                this.gettingApplicant = true;
                this.getCandidate();

            }
        }

    }


    getCandidate() {
        this.jobService.getJobApplicant(this.filter).subscribe((result) => {
            if (result['success']) {
                this.totalRecords = result['success']['data'].total;
                this.ApplicantList = result['success']['data'].records;
                console.log('this.ApplicantList', result['success']['data']);
            }
            this.gettingApplicant = false;
        }, () => {
            this.gettingApplicant = false;
        });
    }

    openCandidate(applicantId: any) {
        this.applicant = {_id: applicantId, isApplicantList: true};
        SiteJS.slideOpen('applicant-info');
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
        console.log('filter', filter);
        this.filter.offset = (filter.pageIndex - 1) * filter.pageSize;
        this.filter.pageSize = filter.pageSize;
        this.filter.pageIndex = filter.pageIndex;
        this.getCandidate();

    }

    getDate(date) {
        const month = date.getMonth() + 1;
        return month + '/' + date.getDate() + '/' + date.getFullYear();
    }

    onUpdate($event) {
        for (let i = 0; i < this.ApplicantList.length; i++) {
            if ($event._id == this.ApplicantList[i]._id) {
                this.ApplicantList[i] = $event;
            }
        }
    }
}
