import { Component, OnInit } from '@angular/core';
import { JobService } from '../../../services/job.service';
import { SharedService } from '../../../services/shared.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-jobs',
  templateUrl: './view-jobs.component.html',
  styleUrls: ['./view-jobs.component.css'],
  providers: [JobService, SharedService]
})
export class ViewJobsComponent implements OnInit {

  jobs = [];
  limit = 10;
  offset = 0;
  jobId = 0;
  job: any;

  constructor(private jobService: JobService,
    private sharedService: SharedService,
    private router: Router) {}

  ngOnInit() {
    this.showJobList(this.limit, this.offset);
  }

  showJobList(limit: any, offset: any) {
    this.jobService.getJob({pageSize: limit, offset: offset, searchText: ''}).subscribe(result => {
      if (result['success']) {
        this.jobs = result['success']['data'];
      }
    });
  }

  deleteJob(id: any) {
    this.jobService.deleteJob(id).subscribe(result => {
      if (result['success']) {
        this.showJobList(this.limit, this.offset);
      }
    });
  }

  setjobId(jobId: any) {
    this.jobs.forEach(element => {
      if (element.id === jobId) {
        this.sharedService.setJobDetail(JSON.stringify(element));
        this.router.navigate(['/createjob']);
      }
    });
  }

  next() {
    this.offset = this.limit;
    this.limit = this.limit + this.jobs.length;
    this.showJobList(this.limit, this.offset);
  }

  previous() {
    this.offset = this.offset - this.offset;
    this.limit = this.limit - this.jobs.length;
    this.showJobList(this.limit, this.offset);
  }

}
