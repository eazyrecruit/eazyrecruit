import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {InterviewService} from '../../services/interview.service';
import {ApplicantDataService} from '../../services/applicant-data.service';
import {FormGroup, FormBuilder} from '@angular/forms';

@Component({
    selector: 'app-interview',
    templateUrl: './interview.component.html',
    styleUrls: ['./interview.component.css'],
    providers: [InterviewService, ApplicantDataService]
})
export class InterviewComponent implements OnInit {

    interview: any;
    results: any;
    applicant: any;
    resume: any;
    resume_html: any;
    newCriteria: String;
    isReadonly = true;
    constructor(
        private route: ActivatedRoute,
        private interviewService: InterviewService,
        private applicantDataService: ApplicantDataService,
        private formBuilder: FormBuilder,
    ) {
    }

    ngOnInit() {
        this.route.params.subscribe((params: Params) => {
            this.interviewService.getInterview(params.interviewId).subscribe(res => {
                if (res['success']) {
                    this.interview = res['success'].data[0];
                    this.interviewService.getResults(this.interview._id).subscribe(res => {
                        if (res['success'] && res['success']['data']) {
                            this.results = res['success']['data'];
                        }
                    });
                    this.applicantDataService.getApplicantCompleteData(this.interview.jobApplicant).subscribe(result => {
                        if (result['success']['data']) {
                            this.applicant = result['success']['data'];
                            this.applicantDataService.getResume(this.applicant.resume).subscribe((result) => {
                                if (result['success'] && result['success']['data']) {
                                    this.resume = result['success']['data'];
                                    if ((this.resume.fileName).includes('.pdf')) {
                                        const blob = this.converBase64toBlob(this.resume.resume, 'application/pdf');
                                        const blobURL = window.URL.createObjectURL(blob);
                                        this.resume_html = `<div><iframe  type="application/pdf" width="100%" height="800px" style="overflow: auto;" src="${blobURL}"></iframe></div>`;
                                    } else {
                                        this.resume_html = this.resume.resume;
                                    }
                                }
                            }, error => {
                                this.resume = null;
                            });
                        }
                    });
                }
            });
        });
    }

    converBase64toBlob(content: any, contentType: any): any {
        contentType = contentType || '';
        const sliceSize = 512;
        const byteCharacters = window.atob(content); // method which converts base64 to binary
        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        const blob = new Blob(byteArrays, {
            type: contentType
        }); // statement which creates the blob
        return blob;
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
        console.log(this.interview);
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
}
