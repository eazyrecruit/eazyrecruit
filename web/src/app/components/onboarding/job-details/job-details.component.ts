import { Component, OnInit, Input } from '@angular/core';
import { ApplyJobService } from '../../../services/apply-job.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { JobService } from '../../../services/job.service';

@Component({
  selector: 'app-job-details',
  templateUrl: './job-details.component.html',
  styleUrls: ['./job-details.component.css'],
  providers: [ApplyJobService, JobService]
})
export class JobDetailsComponent implements OnInit {

  job: any = {};
  skills = [];
  id: any;

  @Input('jobPostId')
  jobPostId: any;

  constructor(private applyJobService: ApplyJobService, 
    private route: ActivatedRoute, 
    private router: Router, 
    private jobService: JobService) { }

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.id = this.route.params['_value'].id;
    });

    if(this.id) {
      this.applyJobService.getJobById(this.id).subscribe(result => {
        if (result['success']) {
          this.job = result['success']['data'];
          let skill = {};
          this.job.forEach(element => {
            skill = element.name;
            this.skills.push(skill);
          });
          this.job = result['success']['data'][0];
        }
      });
    }
  }

  ngOnChanges() {
    if(this.jobPostId) {
      this.jobService.getJobById(this.jobPostId).subscribe(result => {
        if(result['success']['data']) {
          this.job = result['success']['data'];
        }
      });
    }
  }

  goRegistration(id: any) {
    this.router.navigate(['onboarding/register/' + id]);
  }

}
