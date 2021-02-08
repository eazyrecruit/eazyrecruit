import {Component, OnInit, OnDestroy, Input, Output, EventEmitter, OnChanges, TemplateRef} from '@angular/core';
import {BsModalService, BsModalRef} from 'ngx-bootstrap';
import {ActivatedRoute} from '@angular/router';
import {CreateApplicantComponent} from '../create-applicant/create-applicant.component';
import {SharedService} from "../../../services/shared.service";
import {Subscription} from "rxjs";

@Component({
    selector: 'app-applicant-profile-card',
    templateUrl: 'applicant.profile.card.component.html'
})
export class ApplicantProfileCardComponent implements OnChanges, OnDestroy {
    @Input()
    applicant: any;
    @Input()
    isFullPage ?: any;
    @Input()
    notEdit ?: any;
    @Output()
    onUpdate: EventEmitter<any> = new EventEmitter();
    modalRef: BsModalRef;
    isReadonly: true;
    applicantData: any;
    sourceColor: any = this.sharedService.getSourceColor();
    private _subs: Subscription;

    constructor(
        private route: ActivatedRoute,
        private sharedService: SharedService,
        private modalService: BsModalService
    ) {

    }

    ngOnChanges() {
        this.applicantData = this.applicant;
        if (this.applicantData) {
            this.applicantData['fullName'] = this.getFullName(this.applicantData.firstName, this.applicantData.middleName, this.applicantData.lastName);
        }
    }

    getSourceColor(source) {
        return this.sourceColor[source] || '';
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
                this.onUpdate.emit(result['data']);   // new testing
            }
        });
    }

    ngOnDestroy(): void {
        if (this._subs) {
            this._subs.unsubscribe();
        }


    }
}
