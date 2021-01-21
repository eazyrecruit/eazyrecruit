import {Routes, RouterModule} from '@angular/router';
import {ApplicantsComponent} from './applicants.component';
import {ApplicantpageComponent} from './applicantpage/applicantpage.component';

const applicantsRoute: Routes = [
    {path: '', component: ApplicantsComponent},
    {
        path: '/:id',
        component: ApplicantpageComponent
    },
];
export const ApplicantsRouting = RouterModule.forChild(applicantsRoute);
