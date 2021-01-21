import {Routes, RouterModule} from '@angular/router';
import {ProfileComponent} from './profile.component';

const applicantsRoute: Routes = [
    {path: '', component: ProfileComponent}
];
export const ProfileRouting = RouterModule.forChild(applicantsRoute);
