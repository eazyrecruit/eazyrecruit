import {Component, OnInit, OnDestroy} from '@angular/core';
import {ApplicantService} from '../../../../services/applicant.service';
import {ToasterService} from 'angular2-toaster';
import {Subscription} from "rxjs";

@Component({
    selector: 'app-applicant-settings',
    templateUrl: './applicant-settings.component.html',
    providers: [ApplicantService]
})
export class ApplicantSettingsComponent implements OnInit, OnDestroy {
    private _subs: Subscription;

    constructor(
        private applicantService: ApplicantService,
        private toasterService: ToasterService
    ) {
    }

    ngOnInit() {
    }

    reProcessResumes() {
        if (confirm('Are you sure, you want to reprocess all resumes? It might take several minutes.')) {
             this._subs = this.applicantService.reprocess().subscribe(res => {
                this.toasterService.pop('success', 'Success', 'Resume reprocessing started successfully');
            }, err => {
                this.toasterService.pop('error', 'Error', 'Failed to start resume reprocessing');
            });
        }
    }

    reSyncDb() {
        if (confirm('Are you sure, you want to resync db?')) {
             this._subs = this.applicantService.resync().subscribe(res => {
                this.toasterService.pop('success', 'Success', 'Sync started successfully');
            }, err => {
                this.toasterService.pop('error', 'Error', 'Sync failed to start');
            });
        }
    }

    ngOnDestroy(): void {
        if (this._subs) {
            this._subs.unsubscribe();
        }
    }
}
