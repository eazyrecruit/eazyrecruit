import {Routes, RouterModule} from '@angular/router';
import {ReferredApplicantComponent} from './referred.applicant.component';
import {ReferredApplicantJobComponent} from './referred-applicant-Job/referred.applicant.job.component';

const applicantsRoute: Routes = [
    {path: '', pathMatch: 'full', component: ReferredApplicantComponent},
    {path: 'job', component: ReferredApplicantJobComponent},
    {path: 'add/job/:jobId', component: ReferredApplicantComponent}
];
export const ReferredApplicantRouting = RouterModule.forChild(applicantsRoute);
