import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {InterviewService} from '../../../services/interview.service';
import {ApplicantDataService} from '../../../services/applicant-data.service';
import {FormGroup, FormBuilder} from '@angular/forms';
import {AccountService} from '../../../services/account.service';

@Component({
    selector: 'app-interview',
    templateUrl: './interview.component.html',
    providers: [InterviewService, ApplicantDataService]
})
export class InterviewComponent implements OnInit {

    interview: any;
    results: any;
    applicant: any;
    openApplicant: any;
    interviewId;
    resume: any;
    resume_html: any;
    newCriteria: String;
    isReadonly = true;
    role: any;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private interviewService: InterviewService,
        private accountService: AccountService,
        private applicantDataService: ApplicantDataService,
        private formBuilder: FormBuilder,
    ) {
    }

    getApplicantCompleteData() {
        if (this.interview) {
            this.applicantDataService.getApplicantCompleteData(this.interview.jobApplicant).subscribe(result => {
                if (result['success']['data']) {
                    this.applicant = result['success']['data'];
                    this.applicantDataService.getResumeFile(this.applicant.resume._id).subscribe((res) => {
                        const blob = new Blob([res], {
                            type: 'application/pdf'
                        });
                        const blobURL = window.URL.createObjectURL(blob);
                        this.resume_html = `<div><iframe  type="application/pdf" width="100%" height="800px" style="overflow: auto;" src="${blobURL}"></iframe></div>`;
                    }, error => {
                        this.resume = null;
                    });
                }
            });
        }
    }

    getResults() {
        if (this.interview) {
            this.interviewService.getResults(this.interview._id).subscribe(res => {
                if (res['success'] && res['success']['data']) {
                    this.results = res['success']['data'];
                }
            });
        }

    }

    getInterview(isLoadAllData = false) {
        this.interviewService.getInterview(this.interviewId).subscribe(res => {
            if (res['success'] && res['success'].data && res['success'].data.length) {
                this.interview = res['success'].data[0];
                if (isLoadAllData) {
                    this.getResults();
                    this.getApplicantCompleteData();
                }
            } else {
                this.router.navigate([`interview`]);
            }
        }, () => {
            this.router.navigate([`interview`]);
        });
    }

    ngOnInit() {
        this.role = this.accountService.getRole();
        this.route.params.subscribe((params: Params) => {
            this.interviewId = params.interviewId;
            this.getInterview(true);

        });
    }

    addCriteria() {
        if (this.newCriteria.trim().length > 0) {
            if (this.results == null) {
                this.results = [];
            }
            this.interviewService.addCriteria({name: this.newCriteria}).subscribe(result => {
                if (result && result['success'] && result['success']['data']) {
                    this.results.push({
                        interview: this.interview._id,
                        criteria: {name: result['success']['data'].name, _id: result['success']['data']._id},
                        score: 0,
                        created_by: this.interview.interviewer,
                        modified_by: this.interview.interviewer
                    });
                    this.newCriteria = '';
                }
            }, (error) => {
                this.results = [];
            });
        }
    }

    removeCriteria(index) {
        if (index >= 0) {
            if (this.results[index]['_id']) {
                this.interviewService.deleteResult(this.results[index]['_id']).subscribe(res => {
                    if (res['success'] && res['success']['data']) {
                        this.results.splice(index, 1);
                    }
                })
            } else {
                this.results.splice(index, 1);
            }
        }
    }

    onSubmit(action) {
        if (action && this.interview.comment) {
            this.interview.result = action;
            this.interviewService.comment(this.interview).subscribe(res => {
                if (res['success'] && res['success']['data']) {
                    this.interviewService.saveResult(this.results).subscribe(res => {
                        if (res && res['success'] && res['success']['data'] && res['success']['data'].length) {
                            this.results = res['success']['data'].map((element, index) => {
                                if (element.criteria && !element.criteria.hasOwnProperty('_id')) {
                                    element.criteria = this.results[index].criteria;
                                }
                                return element;
                            });
                        }
                    });
                }
            });
        }
    }

    getFullName(firstName, middleName, lastName) {
        var name = firstName;
        if (middleName && middleName != "null") name = name + " " + middleName;
        if (lastName && lastName != "null") name = name + " " + lastName;
        return name;
    }

    openCandidate(applicantId: any) {
        this.openApplicant = {_id: applicantId, isApplicantList: true};
        SiteJS.slideOpen('applicant-info');
    }

    onCancelInterview($event) {
        this.getInterview();
    }

    onUpdate($event) {
        this.getApplicantCompleteData();
    }
}
