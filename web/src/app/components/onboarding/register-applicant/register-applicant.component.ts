import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ValidationService } from '../../../services/validation.service';
import { SkillsService } from '../../../services/skills.service';
import { UploadService } from '../../../services/upload.service';
import { SkillsAssessmentService } from '../../../services/skills-assessment.service';
import { DataShareService } from '../../../services/data-share.service';
import { StateService } from '../../../services/state.service';
import { LocationService } from '../../../services/location.service';
import { BsModalRef, BsModalService } from '../../../../../node_modules/ngx-bootstrap';
import { Subject } from '../../../../../node_modules/rxjs';
import { TouchSequence } from 'selenium-webdriver';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ToasterModule, ToasterService, ToasterConfig} from 'angular2-toaster';

@Component({
    selector: 'app-register-applicant',
    templateUrl: './register-applicant.component.html',
    styleUrls: ['./register-applicant.component.css'],
    providers: [ValidationService, SkillsService,
        UploadService, SkillsAssessmentService, StateService, LocationService, BsModalService]
})
export class RegisterApplicantComponent implements OnInit {

    @Input()
    modalRefrence;

    jobTitle: any;
    errInvalidFile: boolean;
    registrationDetails: FormGroup;
    resumeForm: FormGroup;
    resume: any;
    items = [];
    skills = [];
    skillsAdded = [];
    jobId: any;
    isSkillSelected: boolean;
    applicantJobPostId: any;
    resumeId: any;
    isResumeUploading = false;
    isDetailsUploading = false;
    isSubmitDisabled = true;
    isUploadDisabled = false;
    resumeUploadSuccess = false;
    skillSearchFilter: any = {};
    stateList = [];
    cityList = [];
    modalRef: BsModalRef;
    public onClose: Subject<boolean>;
    availArray = [];

    constructor(private route: ActivatedRoute,
        private fbForm: FormBuilder,
        private router: Router,
        private validationService: ValidationService,
        private skillService: SkillsService,
        private uploadService: UploadService,
        private skillsAssessmentService: SkillsAssessmentService,
        private dataShared: DataShareService,
        private statesService: StateService,
        private locationService: LocationService,
        private modalService: BsModalService) {

        this.registrationDetails = this.fbForm.group({
            firstName: [null, [<any>Validators.required], this.validationService.nameValid],
            lastName: [null, [<any>Validators.required], this.validationService.nameValid],
            email: [null, [<any>Validators.required], this.validationService.emailValid],
            phoneNo: [null, [<any>Validators.required], this.validationService.mobileValid],
            skill: [null, [<any>Validators.required]],
            // title: [null, [<any>Validators.required], this.validationService.jobTitleValid],
            experience: [null, [<any>Validators.required], this.validationService.experienceValid],
            currentCtc: [null, [<any>Validators.required], this.validationService.ctcValid],
            expectedCtc: [null, [<any>Validators.required], this.validationService.ctcValid],
            state: [null, [<any>Validators.required]],
            city: [null, [<any>Validators.required]],
            availability: [null]
        });

        this.resumeForm = this.fbForm.group({
            resume: [null, [<any>Validators.required]]
        });

        this.onClose = new Subject();

        // this.locationService.getState().subscribe(result => {
        // if (result['success']['data']) {
        // let state; 
        // this.stateList = result['success']['data'];
        // console.log('States0:', this.stateList);
        // }
        // });

    }

    ngOnInit() {
        this.dataShared.currentMessage.subscribe(applicantJobPostId => this.applicantJobPostId = applicantJobPostId);
        this.route.params.subscribe((params: Params) => {
            this.jobId = this.route.params['_value'].id;
        });

        this.locationService.getState().subscribe(result => {
            if (result['success']['data']) {
                this.stateList = result['success']['data'];
            }
        });

        this.uploadService.getavailability().subscribe(result => {
            if (result['success']['data']) {
                this.availArray = result['success']['data'];
            }
        });

        this.skillSearchFilter.offset = 0;
        this.skillSearchFilter.pageSize = 10;
        this.skillSearchFilter.searchText = '';

        this.skillsAssessmentService.getAllSkills(this.skillSearchFilter).subscribe(result => {
            if (result['success']) {

                result['success']['data'].rows.forEach(element => {
                    const obj: any = {};
                    obj.value = element.id;
                    obj.display = element.name;
                    this.skills.push(obj);
                });
            }
        });
    }

    eventHandler(event: any) {
        this.registrationDetails.controls['skill'].setValue(event);
    }

    closePopup() {
        this.onClose.next(false);
        this.modalRefrence.hide();
    }

    uploadResume() {
        if (this.resumeForm.get(['resume']).value) {
            this.isResumeUploading = true;
            this.isUploadDisabled = true;
            const formData = new FormData();
            formData.append('resumeData', this.resume);
            this.uploadService.registerApplicant(formData).subscribe(result => {
                if (result['success']) {
                    this.resumeId = result['success']['data']._id;
                    this.resumeForm.reset();
                    this.resumeUploadSuccess = true;
                    // const firstName = result['success']['data'].Name.split(' ').slice(0, -1).join(' ');
                    // const lastName = result['success']['data'].Name.split(' ').slice(-1).join(' ');
                    // this.items = result['success']['data']['Tech Skills'];
                    // this.registrationDetails.setValue({
                    // resumeId: result['success']['data'].resumeId,
                    // email: result['success']['data'].Email[0],
                    // phoneNo: result['success']['data'].Phone[0],
                    // firstName: firstName,
                    // middleName: '',
                    // lastName: lastName,
                    // skill: '' });

                    this.isSubmitDisabled = false;
                }

                this.isResumeUploading = false;
                this.isUploadDisabled = true;
            });
        }
    }

    details(resumeForm: any) {
        if (!this.registrationDetails.valid) {
            this.validationService.validateAllFormFields(this.registrationDetails);
        } else if (this.registrationDetails.valid &&
            this.registrationDetails.controls['skill'].hasError) {
            this.isDetailsUploading = true;
            resumeForm.state = resumeForm.state.split(',')[1];
            resumeForm.availability = resumeForm.availability.split(',');
            resumeForm.guid = this.jobId;
            resumeForm.resumeId = this.resumeId;
            this.uploadService.saveApplicantInMongo(resumeForm).subscribe(result => {
                if (result['success']) {
                    this.isDetailsUploading = false;
                    this.onClose.next(true);
                    this.modalRefrence.hide();
                    this.router.navigate(['/applicants']);
                    this.isDetailsUploading = false;
                    const applicant = result['success']['data'];
                    this.registrationDetails.reset();

                    if (this.router.url === '/applicants') {
                        this.router.navigate(['dashboard/applicants']);
                    } else {
                        this.storeId(applicant.applicantjobPostId);
                        this.router.navigate(['onboarding/skill/' + this.jobId + '/' + applicant.guid]);
                    }
                } else {
                    this.isDetailsUploading = false;
                }
            });
        }

    }

    onFileChange(event) {
        if (event.length > 0) {
            if (event[0].type.includes('pdf') || event[0].type.includes('msword') ||
                event[0].type.includes('vnd.openxmlformats-officedocument.wordprocessingml.document')) {
                this.errInvalidFile = false;
                this.resume = event[0];
            } else {
                this.errInvalidFile = true;
            }
            this.resumeForm.get(['resume']).setValue(event[0].name);

        } else {
            this.resumeForm.get(['resume']).setValue(null);
        }
    }

    storeId(applicantJobPostId: any) {
        this.dataShared.changeMessage(applicantJobPostId);
    }

    getCities(event) {
        const stateId = event.target.value.split(',')[0];
        this.locationService.getCities(stateId).subscribe(result => {
            if (result['success']['data']) {
                this.cityList = result['success']['data'];
            }
        });
    }

    closeCreateApplicantModal() {
        this.modalRef = this.modalService.show(RegisterApplicantComponent);
        this.modalService.hide(1);
    }

}

