import {Routes, RouterModule} from '@angular/router';
import {JobsComponent} from './jobs.component';
import {PipelineComponent} from './pipeline/pipeline.component';

const applicantsRoute: Routes = [
    {path: '', component: JobsComponent},
    {path: 'pipeline/:jobId', component: PipelineComponent},
];
export const JobsRouting = RouterModule.forChild(applicantsRoute);
