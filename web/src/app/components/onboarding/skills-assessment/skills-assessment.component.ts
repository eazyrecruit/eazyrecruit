import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { SkillsAssessmentService } from '../../../services/skills-assessment.service';
import { ValidationService } from '../../../services/validation.service';
import { DataShareService } from '../../../services/data-share.service';

@Component({
  selector: 'app-skills-assessment',
  templateUrl: './skills-assessment.component.html',
  styleUrls: ['./skills-assessment.component.css'],
  providers: [SkillsAssessmentService, ValidationService]
})
export class SkillsAssessmentComponent implements OnInit {

  jobTitle: any;
  applicantId: any;
  jobId: any;
  list: any = {};

  skillDetailForm: FormGroup;
  items: any = [];
  applicantJobPostId: any;

  constructor(private route: ActivatedRoute,
    private fbForm: FormBuilder,
    private router: Router,
    private skillsAssessmentService: SkillsAssessmentService,
    private validationService: ValidationService,
    private dataShared: DataShareService) {}

  ngOnInit() {
    let id: any;
    this.dataShared.currentMessage.subscribe(applicantJobPostId => id = applicantJobPostId);
    this.applicantJobPostId = id;

    this.route.params.subscribe((params: Params) => {
      this.jobId = this.route.params['_value'].id;
      this.applicantId = this.route.params['_value'].applicantId;
    });

    this.skillsAssessmentService.getJobSkills(this.jobId).subscribe(result => {
      if (result['success']) {
        this.list = result['success']['data'];
        for (let i = 0; i < this.list.length; i++) {
          this.addItem(this.list[i]);
        }
      }
    });

    this.skillDetailForm = this.fbForm.group({
      items: this.fbForm.array([])
    });

  }

  get formData() {
    return <FormArray>this.skillDetailForm.get('items');
  }

  createItem(skillValue: any): FormGroup {
    if (skillValue) {
      return this.fbForm.group({
        name: [skillValue.skill.name, [<any>Validators.required]],
        skill_id: [skillValue.skill_id, []],
        applicant_job_post_id: [skillValue.applicant_id, []],
        score: [null, [<any>Validators.required], this.validationService.scoreValid],
      });
    } else {
      return this.fbForm.group({
        name: [null, [<any>Validators.required]],
        score: [null, [<any>Validators.required]],
      });
    }
  }

  addItem(data: any): void {
    this.items = this.skillDetailForm.get('items') as FormArray;
    this.items.push(this.createItem(data));
  }

  details(formDetails: any) {
    if (!this.skillDetailForm.valid) {
      this.validationService.validateAllFormFields(this.skillDetailForm);
    }

    if (this.skillDetailForm.valid) {
      const formData = new FormData();
      formDetails.guid = this.applicantId;
      formDetails.applicantJobPostId = this.applicantJobPostId;
      formData.append('applicantJobPostId', this.applicantJobPostId);
      formData.append('data', JSON.stringify(formDetails));
      this.skillsAssessmentService.saveSelfAssessment(formDetails).subscribe(result => {
        if (result['success']) {
          this.router.navigate(['onboarding/thankyou']);
        }
      });
    }
  }

}
