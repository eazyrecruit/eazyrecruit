import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { JobService } from '../../services/job.service';
import { SharedService } from '../../services/shared.service';
import { DataShareService } from '../../services/data-share.service';
import { ConstService } from '../../services/const.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { JobComponent } from './job/job.component';

@Component({
    selector: 'app-jobs',
    templateUrl: './jobs.component.html',
    providers: [JobService, SharedService]
})
export class JobsComponent implements OnInit {
    url: any;
    jobs = [];
    limit = 10;
    offset = 0;
    jobId = 0;
    job: any;
    jobById: any;
    jobDetails: FormGroup;
    userList = [];
    modalRef: BsModalRef;

    constructor(private jobService: JobService,
        private sharedService: SharedService,
        private router: Router,
        private dataShared: DataShareService,
        private constService: ConstService,
        //private interviewerService: InterviewerService,
        private modalService: BsModalService,
        private fbForm: FormBuilder) {
        this.url = this.constService.publicUrl;
        this.jobDetails = this.fbForm.group({
            title: [null, [<any>Validators.required]]
        });
    }

    ngOnInit() {
        // this.dataShared.currentMessage.subscribe(jobById => this.jobById = jobById);
        this.searchJob();
    }

    storeId(jobById: any) {
        this.dataShared.changeMessage(jobById);
    }

    goToPipeline(id: any, title: any, companyName: any) {
        title = title.replace(/[^a-zA-Z 0-9 .]+/g, ' ');
        this.storeId(id);
        this.router.navigate(['/jobs/pipeline/' + id + '/' + title + '/' + companyName]);
    }


    copyText(val: string) {
        let selBox = document.createElement('textarea');
        selBox.value = val;
        document.body.appendChild(selBox);
        selBox.focus();
        selBox.select();
        document.execCommand('copy');
        document.body.removeChild(selBox);
    }

    searchInterviewer(event, index) {
        // this.interviewerService.getInterviewer(event.target.value).subscribe(result => {
        //     if (result['success']) {
        //         this.jobs[index].userList = result['success']['data'];
        //     }
        // }, (err) => { });
    }

    editJob(jobId, index) {
        this.createJob(jobId, index);
    }

    searchJob(event: any = '') {
        const value = event.target ? event.target.value : event;
        this.jobService.getJob(value).subscribe(result => {
            if (result['success']) {
                this.jobs = result['success'].data;
                // this.dataShared.notificationChangeMessage({ name: 'success', type: 'Success', message: 'No active job found' })
            }
        }, (err) => {
            console.log('error', err);
        });
    }

    createJob(jobId, index) {
        this.modalRef = this.modalService.show(JobComponent, { 
            class: 'modal-lg', 
            initialState: { jobId: jobId } 
        });
        this.modalRef.content.closePopup.subscribe(result => {
            if (result) {
                if (index != null) {
                    this.jobs[index] = result['data'];
                } else {
                    this.jobs.unshift(result['data']);
                }
            }
        });
    }
}
