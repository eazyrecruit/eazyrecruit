import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SharedService } from './../../../services/shared.service';
import { ApplicantService } from '../../../services/applicant.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ValidationService } from '../../../services/validation.service';
import { AccountService } from '../../../services/account.service';
//import { InterviewerService } from '../../../services/interview.service';
import { ApplicantsearchService } from '../applicantsearch/applicantsearch.service';
import { JobService } from '../../../services/job.service';
import { Router } from '@angular/router';

@Component({
    selector: 'applicant-card',
    templateUrl: './applicant.card.component.html',
    providers: [
        ApplicantService, ValidationService,
        AccountService,
        ApplicantsearchService,
        JobService
    ]
})
export class ApplicantCardComponent implements OnInit {

    applicants: any = {};
    searchForm: FormGroup;
    userList = [];
    isInterviewerSelected: boolean;
    matchedSkills = [];
    selectedPipeline: any;

    @Input()
    applicant?: any;

    @Input()
    pipelines: any;

    @Input()
    pipelineItem: any;

    @Output()
    onSelect: EventEmitter<any> = new EventEmitter();

    @Output()
    changeStatus: EventEmitter<any> = new EventEmitter();

    @Output()
    removeApplicant: EventEmitter<any> = new EventEmitter();

    name_clicked(): void {
        // this.applicantService.getApplicantInfo(this.applicant.applicant_id).subscribe(result => {
        //     if (result['success']['data']) {
        //         this.applicant.applicant.skills = result['success']['data'][0].skills;
        //         this.applicant.applicantResumes = result['success']['data'][0].applicant_resumes;
        //         this.applicant.jobPost = result['success']['data'][0].job_posts;
        //         this.initilizeSidebar(this.applicant.applicant);

        //         // if(this.applicant.applicant.chipmunc_id) {
        //         //     this.applicantSearch.getApplicantInfo(this.applicant.applicant.chipmunc_id).subscribe(data => {
        //         //         if (data['success']) {
        //         //           this.applicant.applicant = data['success']['data'];
        //         //           this.initilizeSidebar(this.applicant.applicant);
        //         //         }
        //         //       });
        //         // } else {
        //         //     this.applicantSearch.getProfileByEmail(this.applicant.applicant.email).subscribe(data => {
        //         //         if (data['success']['data'].length > 0) {
        //         //             console.log('emial', data['success']['data']);
        //         //             this.applicant.applicant = data['success']['data'][0];
        //         //             this.applicant.skills = result['success']['data'].skills[0];
        //         //             // this.applicant.applicantResumes = result['success']['data'][0].applicant_resumes;
        //         //             // this.applicant.jobPost = result['success']['data'][0].job_posts;
        //         //             this.initilizeSidebar(this.applicant.applicant);
        //         //         }
        //         //     });
        //         // }
        //     }
        // });

        // this.applicantService.getComments(this.applicant.id).subscribe(result => {
        //     if (result['success']['data']) {
        //         this.applicant.comments = result['success']['data'];
        //         this.onSelect.emit(this.applicant);
        //     }
        // });
        this.onSelect.emit(this.applicant.applicant);
    }

    initilizeSidebar(applicant) {
        // let nameArray = applicant.name.split(/[ ]+/);
        // this.applicant.applicant.first_name = nameArray.length > 2 ? nameArray[0] + ' ' + nameArray[1] : nameArray[0];
        // this.applicant.applicant.last_name = nameArray.length > 2 ? nameArray[2] : nameArray[1];
        // this.applicant.matchedSkills = this.filterApplicantSkills(applicant.skills);
        // this.applicant.skills = applicant.skills;
        // this.applicant.location = applicant.addresses;
        // this.applicant.applicantResumes.push(applicant.resumes);
    }

    fullName(fName: string, mName: string, lName: string): string {
        let name = 'Not Available';
        if (fName) {
            name = fName;
        }
        if (mName) {
            name = `${name} ${mName}`;
        }
        if (lName) {
            name = `${name} ${lName}`;
        }
        return name;
    }

    constructor(private sharedService: SharedService,
        private applicantService: ApplicantService,
        private fbuilder: FormBuilder,
        private validationService: ValidationService,
        private accountService: AccountService,
        //private interviewerService: InterviewerService,
        private applicantSearch: ApplicantsearchService,
        private jobService: JobService,
        private router: Router) {
        this.searchForm = fbuilder.group({
            user: [null, [<any>Validators.required]],
        });
    }

    ngOnInit() {
        this.selectedPipeline = this.applicant.pipeline;
        if (this.applicant && this.applicant.applicant) {
            this.applicant.applicant.fullName = this.getFullName.bind(this.applicant.applicant);
        } else {
            this.applicant.fullName = this.getFullName.bind(this.applicant);
        }
        // if (this.applicant && this.applicant.applicant && this.applicant.applicant.personal) {
        //     this.applicant.applicant.fullName = this.fullName(this.applicant.applicant.personal.first_name,
        //         this.applicant.applicant.personal.middle_name, this.applicant.applicant.personal.last_name);
        // } else {
        //     this.applicant.applicant.fullName = this.fullName(null, null, null);
        // }

        // this.applicants = JSON.parse(this.sharedService.getDeptDetail());
        // this.sharedService.deleteDeptDetail();
        // this.interviewerService.getInterviewerByJobId(this.applicant.job_post.id).subscribe(result => {
        //     if (result['success']) {
        //         this.userList = result['success']['data'];
        //     }
        // }, (err) => { });
        // get interviewer assigned to applicant
        // this.matchedJobSkills();
        // this.jobService.getJobSkillsById(this.applicant.job_post.id).subscribe(result => {
        //     if (result['success']) {
        //         this.matchedSkills = result['success']['data'];
        //     }
        // }, (err) => { });
    }

    onUserSelect(event) {
        if (event.target.value > 0) {
            this.isInterviewerSelected = false;
            const interviewer: any = {};
            interviewer.interviewerId = +event.target.value;
            interviewer.jobPostId = this.applicant.job_post.id;
            // this.interviewerService.assignInterviewerToApplicant(interviewer).subscribe(result => {
            //     if (result['success']['data']) {
            //         this.userList.forEach(element => {
            //             if (element.user_detail.user_id === interviewer.interviewerId) {
            //                 const fullName = element.user_detail.first_name + ' ' + element.user_detail.last_name;
            //                 this.applicant.interviewer = fullName;
            //             }
            //         });
            //         alert('interviewer assigned successfully');
            //     }
            // });
        } else {
            this.isInterviewerSelected = true;
        }
    }

    matchedJobSkills() {
        this.jobService.getJobSkillsById(this.applicant.job_post.id).subscribe(result => {
            if (result['success']) {
                this.matchedSkills = result['success']['data'];
            }
        }, (err) => { });
    }

    filterApplicantSkills(skills: any) {
        let i = 0;
        let matched = new Set();
        skills.forEach(element => {
            this.matchedSkills.forEach(skill => {
                if (element.toLowerCase().trim() === skill.skill.name.toLowerCase().trim()) {
                    matched.add(element);
                    skills.splice(i, 1);
                    i--;
                }
            });
            i++;
        });
        return matched;
    }

    changePipelineStatus(event: any) {
        /* Always specify this parameter to eliminate reader confusion and to guarantee predictable behavior.
        Different implementations produce different results when a radix is not specified,
        usually defaulting the value to 10. */
        if (event && event.target && this.applicant.pipeline !== parseInt(event.target.value, 10)) {
            this.applicant.moveToPipeline = event.target.value;
            this.selectedPipeline = this.applicant.moveToPipeline;
            this.changeStatus.emit(this.applicant);
        }
    }

    removeUser(jobApplicantId: any) {
        let result = this.applicantService.removeApplicantFromJob(jobApplicantId)
        if (result) {
            this.removeApplicant.emit({ isDeleted: true });
        } else {
            this.removeApplicant.emit({ isDeleted: false })
        }
    }

    getFullName(firstName, middleName, lastName) {
        var name = firstName;
        // console.log(firstName, middleName, lastName);
        if (middleName && middleName != "null") name = name + " " + middleName;
        if (lastName && lastName != "null") name = name + " " + lastName;
        return name;
    }

}
