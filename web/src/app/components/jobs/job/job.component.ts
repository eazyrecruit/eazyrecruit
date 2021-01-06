import {Component, OnInit, Output, EventEmitter} from '@angular/core';
import {ValidationService} from '../../../services/validation.service';
import {FormGroup, FormBuilder, Validators, FormArray} from '@angular/forms';
import {JobService} from '../../../services/job.service';
import {SharedService} from '../../../services/shared.service';
import {Router} from '@angular/router';
import {DepartmentService} from '../../../services/department.service';
import {CompanyService} from '../../../services/company.service';
import {SkillsService} from '../../../services/skills.service';
import {LocationService} from '../../../services/location.service';
import {BsModalRef} from 'ngx-bootstrap';
import {Observable, Subject} from 'rxjs';
import {map} from 'rxjs/operators';

declare var SiteJS: any;

@Component({
    selector: 'app-job',
    templateUrl: './job.component.html',
    styleUrls: ['./job.component.css'],
    providers: [JobService, SharedService, ValidationService,
        DepartmentService, CompanyService, SkillsService, LocationService]
})
export class JobComponent implements OnInit {
    errInvalidFile: Boolean = false;
    departmentList: any[];
    companyList = [];
    jobTypes = [{display: 'Part-Time', value: 'Part-Time'}, {display: 'Full-Time', value: 'Full-Time'}];
    jobDetails: FormGroup;
    limit = 10;
    offset = 0;
    jobId: any;
    job: any;
    skills = [];
    userList: any[] = [];
    locations = [];
    isSkillSelected: boolean;
    errorDescription: boolean;
    errorResponsiblity: boolean;
    items: any = [];
    filter: any;
    submit: Boolean = false;
    stateList = [];
    cityList = [];
    skillFilter: any;
    active: boolean;
    publish: boolean;
    closePopup: Subject<any>;
    metaImage: any;
    currentMetaImage: any;

    @Output()
    refreshList: EventEmitter<boolean> = new EventEmitter<boolean>();


    quillConfig = {

        toolbar: {
            container: [
                ['bold', 'italic', 'underline', 'strike'],
                ['code-block'],
                [{'header': 1}, {'header': 2}],
                [{'list': 'ordered'}, {'list': 'bullet'}],

                ['clean'],

                ['link']
            ],
        }
    };


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
        this.closePopup = new Subject<any>();
        this.getUser();
        if (this.jobId) {
            this.jobService.getJobById(this.jobId).subscribe(result => {
                if (result['success']) {
                    this.job = result['success'].data;
                    this.populateForm(this.job);
                }
            });
        }
    }

    getUser() {
        this.jobService.getHrAdmin().subscribe(result => {
            if (result['success'] && result['success'].data) {
                this.userList = result['success'].data;
                console.log('ActivityData', this.userList);
            }
        });
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
        this.submit = false;
        this.jobDetails = this.fbForm.group({
            _id: [null],
            title: [null, [<any>Validators.required], this.validationService.jobTitleValid],
            active: [null],
            is_published: [null],
            skills: [null, [<any>Validators.required]],
            locations: [null, [<any>Validators.required]],
            type: [null],
            expiryDate: [null],
            recruitmentManager: [null, [<any>Validators.required]],
            minExperience: [null, [], this.validationService.jobExperience],
            maxExperience: [null, [], this.validationService.jobExperience],
            ctc: [null],
            description: [null],
            responsibilities: [null],
            metaImage: [null],
            metaImageAltText: [null],
            metaTitle: [null],
        });
        if (job) {
            this.active = job.active;
            this.publish = job.is_published;
            this.jobDetails.controls['_id'].setValue(job._id);
            this.jobDetails.controls['title'].setValue(job.title);
            this.jobDetails.controls['active'].setValue(job.active);
            this.jobDetails.controls['is_published'].setValue(job.is_published);
            this.jobDetails.controls['minExperience'].setValue(job.minExperience);
            this.jobDetails.controls['maxExperience'].setValue(job.maxExperience);
            this.jobDetails.controls['ctc'].setValue(job.ctc);
            this.jobDetails.controls['type'].setValue(job.type);
            this.jobDetails.controls['expiryDate'].setValue(new Date(job.expiryDate));
            this.jobDetails.controls['recruitmentManager'].setValue(job.recruitmentManager || null);
            this.jobDetails.controls['skills'].setValue(this.addDisplayName(job.skills));
            this.jobDetails.controls['locations'].setValue(this.addDisplayName(job.locations));
            this.jobDetails.controls['description'].setValue(job.description);
            this.jobDetails.controls['responsibilities'].setValue(job.responsibilities);
            this.jobDetails.controls['metaImage'].setValue(job.metaImage);
            this.jobDetails.controls['metaImageAltText'].setValue(job.metaImageAltText);
            this.jobDetails.controls['metaTitle'].setValue(job.metaTitle);
            this.currentMetaImage = job.metaImage;
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

        if (!this.jobDetails.valid || !this.active) {
            this.validationService.validateAllFormFields(this.jobDetails);
        } else {
            const formData = new FormData();
            for (const key in jobForm) {
                if (jobForm[key] !== null) {
                    formData.append(key, jobForm[key]);
                }
            }
            const skill = [];
            const current = [];
            const preferred = [];
            if (jobForm.skills) {
                for (let index = 0; index < jobForm.skills.length; index++) {
                    if (jobForm.skills[index]._id) {
                        skill.push({_id: jobForm.skills[index]._id, name: jobForm.skills[index].name});
                    } else {
                        skill.push({name: jobForm.skills[index].value});
                    }
                }
                formData.set('skills', JSON.stringify(skill));
            }

            if (jobForm.locations) {
                for (let index = 0; index < jobForm.locations.length; index++) {
                    if (jobForm.locations[index]._id) {
                        current.push({
                            _id: jobForm.locations[index]._id,
                            country: jobForm.locations[index].country,
                            state: jobForm.locations[index].state,
                            city: jobForm.locations[index].city,
                            zip: jobForm.locations[index].zip
                        });
                    } else {
                        current.push({
                            _id: jobForm.locations[index]._id,
                            country: jobForm.locations[index].country,
                            state: jobForm.locations[index].state,
                            city: jobForm.locations[index].city,
                            zip: jobForm.locations[index].zip
                        });
                    }
                }
                formData.set('locations', JSON.stringify(current));
            }

            if (this.publish && !this.jobDetails.value['metaTitle']) {
                this.submit = true;
                return;
            }


            if (this.metaImage) {
                formData.set('metaImage', this.metaImage);
            } else if (this.currentMetaImage) {
                formData.set('metaImage', this.currentMetaImage);
            }
            this.jobService.saveJob(formData).subscribe(result => {
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
        const filter = {pageSize: 10, offset: 0, searchText: text};
        return this.skillService.getSkills(filter).pipe(map((result: any) => result.success.data.skills));
    }

    public asyncLocations = (text: string): Observable<any> => {
        return this.locationService.getLocations(text).pipe(map((data: any) => data.success.data));
    }

    onFileChange(event) {
        const reader = new FileReader();
        if (event && event.length) {
            this.errInvalidFile = false;
            if (event[0].type.includes('jpg') || event[0].type.includes('jpeg') || event[0].type.includes('png')) {
                reader.onload = () => {
                    this.metaImage = event[0];
                };
                reader.readAsDataURL(event[0]);
            } else {
                this.errInvalidFile = true;
                this.jobDetails.get(['metaImage']).setValue('');
                this.metaImage = null;
            }
        } else {
            this.jobDetails.get(['metaImage']).setValue('');
            this.metaImage = null;
        }
    }
}
