import {Component, OnInit} from '@angular/core';
import {SearchService} from '../../services/search.service';
import {JobService} from '../../services/job.service';
import {PipelineService} from '../../services/pipeline.service';
import {SharedService} from '../../services/shared.service';
import {el} from '@angular/platform-browser/testing/src/browser_util';

@Component({
    selector: 'app-applicants',
    templateUrl: './applicants.component.html',
    providers: [SearchService, JobService, PipelineService]
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
    colorClass: any = this.sharedService.getPipeLineColor();
    sourceColor: any = this.sharedService.getSourceColor();

    constructor(private searchService: SearchService,
                private pipelineService: PipelineService,
                private sharedService: SharedService,
                private jobService: JobService) {

    }

    getJobsName() {
        this.jobService.getWithApplicantsAndPipelineById().subscribe(result => {
            if (result['success']) {
                this.jobs = result['success']['data'];
                for (let index = 0; index < this.jobs.length; index++) {
                    this.jobIds[this.jobs[index]._id] = this.jobs[index];
                }
                this.getCandidate();
            }
        });
    }

    ngOnInit() {
        this.startDate.setMonth(new Date().getMonth() - 2);
        this.endMinDate = this.startDate;
        this.filter.startDate = this.getDate(this.startDate);
        this.filter.endDate = this.getDate(this.endDate);
        this.getJobsName();

    }

    getSourceColor(source) {
        return this.sourceColor[source] || '';
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
                this.getCandidate();

            }
        }

    }

    getSelectedValue(pipeLine, id) {
        return pipeLine === id;
    }

    onChangeItemStatusFilter(pipelineId, applicant) {
        if (!this.getSelectedValue(applicant.pipeline, pipelineId)) {
            this.pipelineService.updateApplicantStatus({
                pipeline: pipelineId,
                job: applicant.job._id,
                applicant: applicant._id,
                id: applicant.jobApplicantsId
            }).subscribe((result) => {
                if (result['success']['data']) {
                    this.getCandidate();
                }
            });
        }
    }

    getCandidate() {
        this.gettingApplicant = true;
        this.ApplicantList = [];
        this.jobService.getJobApplicant(this.filter).subscribe((result) => {
            if (result['success']) {
                this.totalRecords = result['success']['data'].total;
                const applicants = result['success']['data'].records;
                for (let index = 0; index < applicants.length; index++) {
                    const jobApplicants = applicants[index];
                    const applicant = Object.assign({}, jobApplicants.Applicants);
                    applicant['created_at'] = jobApplicants['created_at'];
                    applicant['modified_at'] = jobApplicants['modified_at'];
                    applicant['jobApplicantsId'] = jobApplicants._id;
                    applicant['pipeline'] = jobApplicants.pipeline;
                    applicant['job'] = this.jobIds[jobApplicants.job];
                    if (this.jobIds[jobApplicants.job]) {
                        this.ApplicantList.push(applicant);
                    }

                }

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

    getPipeLineObject(pipeline) {
        const pipelineObject = {};
        for (let index = 0; index < pipeline.length; index++) {
            pipelineObject[pipeline[index]._id] = pipeline[index].name;
        }

        return pipelineObject;

    }

    getSelectedColor(name) {
        return this.colorClass[name] || '';
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
