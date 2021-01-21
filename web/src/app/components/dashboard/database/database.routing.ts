import {Routes, RouterModule} from '@angular/router';
import {DatabaseComponent} from './database.component';

const applicantsRoute: Routes = [
    {path: '', component: DatabaseComponent},
    {path: 'add/job/:jobId/:pipelineId', component: DatabaseComponent}
];
export const DatabaseRouting = RouterModule.forChild(applicantsRoute);
