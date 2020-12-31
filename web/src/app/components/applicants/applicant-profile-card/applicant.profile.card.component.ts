import {Component, OnInit, Input, Output, EventEmitter, OnChanges, TemplateRef} from '@angular/core';
import {BsModalService, BsModalRef} from 'ngx-bootstrap';
import {ActivatedRoute} from '@angular/router';
import {CreateApplicantComponent} from '../create-applicant/create-applicant.component';

@Component({
    selector: 'app-applicant-profile-card',
    templateUrl: 'applicant.profile.card.component.html'
})
export class ApplicantProfileCardComponent implements OnChanges {
    @Input()
    applicant: any;
    @Output()
    onUpdate: EventEmitter<any> = new EventEmitter();
    modalRef: BsModalRef;
    isReadonly: true;
    applicantData: any;

    constructor(
        private route: ActivatedRoute,
        private modalService: BsModalService
    ) {

    }

    ngOnChanges() {
        this.applicantData = this.applicant;
        if (this.applicantData) {
            this.applicantData['fullName'] = this.getFullName(this.applicantData.firstName, this.applicantData.middleName, this.applicantData.lastName);
        }
        console.log('ApplicantProfileCardComponent', this.applicant);
    }

    getFullName(firstName, middleName, lastName) {
        let name = firstName;
        if (middleName && middleName != 'null') name = name + ' ' + middleName;
        if (lastName && lastName != 'null') name = name + ' ' + lastName;
        return name;
    }

    updateApplicant() {
        this.modalRef = this.modalService.show(CreateApplicantComponent, {
            class: 'modal-lg',
            initialState: {applicant: this.applicant}
        });
        this.modalRef.content.closePopup.subscribe(result => {
            if (result) {
                // this.onUpdate.emit(this.applicant);   // old
                result['data'].fullName = this.getFullName.bind(this.applicant);
                this.onUpdate.emit(result['data']);   // new testing
            }
        });
    }
}
