import {Routes, RouterModule} from '@angular/router';
import {InterviewComponent} from './interview.component';
import {InterviewListComponent} from './interview-list/interview.list.component';

const applicantsRoute: Routes = [
    {path: '', component: InterviewListComponent},
    {
        path: ':interviewId',
        component: InterviewComponent
    },
];
export const InterviewRouting = RouterModule.forChild(applicantsRoute);
