import {NgModule} from '@angular/core';
import {ReferredApplicantRouting} from './referred.applicant.routing';
import {ReferredApplicantInfoComponent} from './referred-applicant-info/referred.applicant.info.component';
import {ReferredApplicantComponent} from './referred.applicant.component';
import {ReferredApplicantJobComponent} from './referred-applicant-Job/referred.applicant.job.component';
import {CreateReferredApplicantComponent} from './create-referred-applicant/create.referred.applicant.component';
import {DashboardCommonModule} from '../../common/common.module';
import {ModalModule, PaginationModule} from 'ngx-bootstrap';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {RefererJobCardComponent} from "./refered-job-card/referer-job-card.component";

@NgModule({
    imports: [ReferredApplicantRouting, ModalModule.forRoot(), CommonModule,
        DashboardCommonModule, PaginationModule, ReactiveFormsModule, FormsModule],
    entryComponents: [CreateReferredApplicantComponent],
    declarations: [
        CreateReferredApplicantComponent,
        ReferredApplicantComponent,
        ReferredApplicantJobComponent,
        ReferredApplicantInfoComponent,
        RefererJobCardComponent
    ]
})
export class ReferredApplicantModule {
}
