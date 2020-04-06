import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ValidationService } from '../../../services/validation.service';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { JobService } from '../../../services/job.service';
import { SharedService } from '../../../services/shared.service';
import { Router } from '@angular/router';
import { DepartmentService } from '../../../services/department.service';
import { CompanyService } from '../../../services/company.service';
import { SkillsService } from '../../../services/skills.service';
import { LocationService } from '../../../services/location.service';
import { BsModalRef } from 'ngx-bootstrap';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

declare var SiteJS: any;

@Component({
  selector: 'app-job',
  templateUrl: './job.component.html',
  styleUrls: ['./job.component.css'],
  providers: [JobService, SharedService, ValidationService,
    DepartmentService, CompanyService, SkillsService, LocationService]
})
export class JobComponent implements OnInit {

  departmentList: any[];
  companyList = [];
  jobTypes = [{ display: 'Part-Time', value: 'Part-Time' }, { display: 'Full-Time', value: 'Full-Time' }];
  jobDetails: FormGroup;
  limit = 10;
  offset = 0;
  jobId: any;
  job: any;
  skills = [];
  locations = [];
  isSkillSelected: boolean;
  errorDescription: boolean;
  errorResponsiblity: boolean;
  items: any = [];
  filter: any;
  stateList = [];
  cityList = [];
  skillFilter: any;
  active: boolean;
  publish: boolean;
  closePopup: Subject<any>;

  @Output()
  refreshList: EventEmitter<boolean> = new EventEmitter<boolean>();


  quillConfig = {
    //toolbar: '.toolbar',
    toolbar: {
      container: [
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        ['code-block'],
        [{ 'header': 1 }, { 'header': 2 }],               // custom button values
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        //[{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
        //[{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
        //[{ 'direction': 'rtl' }],                         // text direction

        //[{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
        //[{ 'header': [1, 2, 3, 4, 5, 6, false] }],

        //[{ 'font': [] }],
        //[{ 'align': [] }],

        ['clean'],                                         // remove formatting button

        ['link'],
        //['link', 'image', 'video']  
        //['emoji'], 
      ],
      //handlers: {'emoji': function() {}}
    },
    //autoLink: true

    // mention: {
    //   allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
    //   mentionDenotationChars: ["@", "#"],
    //   source: (searchTerm, renderList, mentionChar) => {
    //     let values;

    //     if (mentionChar === "@") {
    //       values = this.atValues;
    //     } else {
    //       values = this.hashValues;
    //     }

    //     if (searchTerm.length === 0) {
    //       renderList(values, searchTerm);
    //     } else {
    //       const matches = [];
    //       for (var i = 0; i < values.length; i++)
    //         if (~values[i].value.toLowerCase().indexOf(searchTerm.toLowerCase())) matches.push(values[i]);
    //       renderList(matches, searchTerm);
    //     }
    //   },
    // },
    // "emoji-toolbar": true,
    // "emoji-textarea": false,
    // "emoji-shortname": true,
    // keyboard: {
    //   bindings: {
    //     // shiftEnter: {
    //     //   key: 13,
    //     //   shiftKey: true,
    //     //   handler: (range, context) => {
    //     //     // Handle shift+enter
    //     //     console.log("shift+enter")
    //     //   }
    //     // },
    //     enter:{
    //       key:13,
    //       handler: (range, context)=>{
    //         console.log("enter");
    //         return true;
    //       }
    //     }
    //   }
    // }
  }



  constructor(
    public bsModelRef: BsModalRef,
    private jobService: JobService,
    private fbForm: FormBuilder,
    private validationService: ValidationService,
    private sharedService: SharedService,
    private router: Router,
    private departmentService: DepartmentService,
    private companyService: CompanyService,
    private skillService: SkillsService,
    private locationService: LocationService) {
    this.populateForm(null);
  }

  ngOnInit() {
    // this.companyService.searchCompany().subscribe(result => {
    //   if (result['success']) {
    //     this.companyList = result['success']['data']['rows'];
    //   }
    // });

    // this.locationService.getState().subscribe(result => {
    //   if (result['success']['data']) {
    //     this.stateList = result['success']['data'];
    //   }
    // });

    // this.jobDetails = this.fbForm.group({
    //   items: this.fbForm.array([this.createItem()])
    // });

    // this.jobId = JSON.parse(this.sharedService.getJobDetail());
    // this.sharedService.deleteJobDetail();
    this.closePopup = new Subject<any>();
    if (this.jobId) {
      this.jobService.getJobById(this.jobId).subscribe(result => {
        if (result['success']) {
          this.job = result['success'].data;
          this.populateForm(this.job);
        }
      });
    }
  }

  eventHandler(event: any) {
    if (event[0].city) {
      this.jobDetails.controls['location'].setValue(event);
    } else {
      this.jobDetails.controls['skill'].setValue(event);
    }
  }

  get formData() {
    return <FormArray>this.jobDetails.get('items');
  }

  createItem(): FormGroup {
    return this.fbForm.group({
      name: [null, []],
      comment: [null, [<any>Validators.required]],
    });
  }

  addItem(): void {
    this.items = this.jobDetails.get('items') as FormArray;
    this.items.push(this.createItem());
  }

  removeItem(index: any) {
    if (index !== 0) {
      (this.jobDetails.get('items') as FormArray).removeAt(index);
    }
  }

  getDepartment(event) {
    let value;
    if (event.target) {
      value = parseInt(event.target.value);
    } else {
      value = parseInt(event);
    }
    if (value > 0) {
      // this.isCompanySelect = false;
      this.departmentService.searchDepartment(value).subscribe(result => {
        if (result['success']) {
          this.departmentList = result['success']['data'];
        }
      });
    }
  }

  populateForm(job: any) {
    this.jobDetails = this.fbForm.group({
      _id: [null],
      title: [null, [<any>Validators.required], this.validationService.jobTitleValid],
      active: [null],
      is_published: [null],
      skills: [null],
      locations: [null],
      type: [null],
      expiryDate: [null],
      minExperience: [null, [], this.validationService.jobExperience],
      maxExperience: [null, [], this.validationService.jobExperience],
      ctc: [null],
      description: [null],
      responsibilities: [null],
      metaImage: [null],
      metaImageAltText: [null],
      metaTitle: [null, [<any>Validators.required]],
    });
    if (job) {
      //this.jobDetails.controls['company'].setValue(job.department.company_id, { onlySelf: true });
      //this.getDepartment(job.department.company_id);
      //this.jobDetails.controls['department'].setValue(job.department.id, { onlySelf: true });
      this.active = job.active;
      this.publish = job.is_published;
      this.jobDetails.controls["_id"].setValue(job._id);
      this.jobDetails.controls["title"].setValue(job.title);
      this.jobDetails.controls["active"].setValue(job.active);
      this.jobDetails.controls["is_published"].setValue(job.is_published);
      this.jobDetails.controls["minExperience"].setValue(job.minExperience);
      this.jobDetails.controls["maxExperience"].setValue(job.maxExperience);
      this.jobDetails.controls["ctc"].setValue(job.ctc);
      this.jobDetails.controls["type"].setValue(job.type);
      this.jobDetails.controls["expiryDate"].setValue(job.expiryDate);
      this.jobDetails.controls["skills"].setValue(this.addDisplayName(job.skills));
      this.jobDetails.controls["locations"].setValue(this.addDisplayName(job.locations));
      this.jobDetails.controls["description"].setValue(job.description);
      this.jobDetails.controls["responsibilities"].setValue(job.responsibilities);
      this.jobDetails.controls["metaImage"].setValue(job.metaImage);
      this.jobDetails.controls["metaImageAltText"].setValue(job.metaImageAltText);
      this.jobDetails.controls["metaTitle"].setValue(job.metaTitle);
    }
  }

  addDisplayName(array: any) {
    if (array && array.length) {
      array.forEach(obj => {
        if (obj.hasOwnProperty('city')) {
          obj['display'] = obj['city'];
        } else {
          obj['display'] = obj['name'];
        }
      });
      return array;
    } else {
      return [];
    }
  }

  jobDetail(jobForm: any) {
    // console.log(jobForm);
    // if (!this.jobDetails.valid) {
    //   this.validationService.validateAllFormFields(this.jobDetails);
    // }
    // if (this.jobDetails.valid) {
    //   if (this.job) {
    //     this.editJob(jobForm, this.job.id);
    //   } else {
    this.createJob(jobForm);
    //   }
    // }
  }

  createJob(jobForm: any) {
    // if (jobForm.type) {
    //   jobForm.type = jobForm.type.map(x => x.value);
    // }

    if (!this.jobDetails.valid || !this.active || !this.publish) {
      this.validationService.validateAllFormFields(this.jobDetails);
    } else {
      this.jobService.saveJob(jobForm).subscribe(result => {
        if (result['success']) {
          // this.publishJob(jobForm);
          // this.jobDetails.reset();
          // this.refreshList.emit(true);
          this.closePopup.next(result['success']);
          this.bsModelRef.hide();
        }
      });
    }
  }

  publishJob(jobForm: any) {
    // if (!this.jobDetails.valid) {
    //   this.validationService.validateAllFormFields(this.jobDetails);
    // } else {
      //publish

      // this.jobService.saveJob(jobForm).subscribe(result => {
      //   if (result['success']) {
      //     this.jobDetails.reset();
      //     this.refreshList.emit(true);
      //     this.router.navigate(['/jobs']);
      //   }
      // });
    // }
  }

  editJob(jobForm: any, id: any) {
    jobForm.id = id;
    // Bind Description value from wysihtml to text
    if (SiteJS.getWysContent('txtDescription') && SiteJS.getWysContent('txtDescription').length > 0) {
      jobForm.description = SiteJS.getWysContent('txtDescription');
    } else {
      this.errorDescription = true;
      return;
    }
    // Bind Reponsibility value from wysihtml to text
    if (SiteJS.getWysContent('txtReponsibility') && SiteJS.getWysContent('txtReponsibility').length > 0) {
      jobForm.responsibilities = SiteJS.getWysContent('txtReponsibility');
    } else {
      this.errorDescription = true;
      return;
    }
    this.jobService.editJob(jobForm).subscribe(result => {
      if (result['success']) {
        this.jobDetails.reset();
        this.refreshList.emit(true);
        this.router.navigate(['/jobs']);
      }
    });
  }

  getCities(event) {
    const stateId = event.target.value;
    this.locationService.getCities(stateId).subscribe(result => {
      if (result['success']['data']) {
        this.cityList = result['success']['data'];
      }
    });
  }

  onClose() {
    this.bsModelRef.hide();
  }

  public asyncSkills = (text: string): Observable<any> => {
    let filter = { pageSize: 10, offset: 0, searchText: text };
    return this.skillService.getSkills(filter).pipe(map((result: any) => result.success.data.skills ));
  };
  
  public asyncLocations = (text: string): Observable<any> => {
    return this.locationService.getLocations(text).pipe(map((data: any) => data.success.data));
  };
}
