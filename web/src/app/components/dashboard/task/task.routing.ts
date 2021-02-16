import {Routes, RouterModule} from '@angular/router';
import {TaskComponent} from './task.component';

const applicantsRoute: Routes = [
    {path: '', component: TaskComponent}
];
export const TaskRouting = RouterModule.forChild(applicantsRoute);
