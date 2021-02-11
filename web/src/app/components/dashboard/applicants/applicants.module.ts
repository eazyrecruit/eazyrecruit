import {NgModule} from '@angular/core';
import {ApplicantpageComponent} from './applicantpage/applicantpage.component';
import {ApplicantsComponent} from './applicants.component';
import {ApplicantsRouting} from './applicants.routing';
import {FormsModule} from '@angular/forms';
import {BsDatepickerModule} from 'ngx-bootstrap';
import {DashboardCommonModule} from '../../common/common.module';
import {CommonModule} from '@angular/common';

@NgModule({
    imports: [ApplicantsRouting, FormsModule, BsDatepickerModule, DashboardCommonModule, CommonModule],
    declarations: [
        ApplicantsComponent,
        ApplicantpageComponent,
    ]
})
export class ApplicantModule {
}
