import {Routes, RouterModule} from '@angular/router';
import {SettingsComponent} from './settings.component';
import {CompanysettingsComponent} from './companysettings/companysettings.component';
import {SkillComponent} from './skill/skill.component';
import {UsersComponent} from './users/users.component';
import {ApplicantSettingsComponent} from './applicants/applicant-settings.component';
import {EmailsettingsComponent} from './emailsettings/emailsettings.component';
import {GoogleComponent} from './google/google.component';
import {GoogleAnalyticsComponent} from './googleAnalytics/google.analytics.component';
import {GoogleRecaptchaComponent} from './googleRecaptcha/google.recaptcha.component';
import {InterviewIntegrationComponent} from './Interview-Integration/interview.integration.component';

const applicantsRoute: Routes = [
    {
        path: '', component: SettingsComponent, children: [
            {path: '', pathMatch: 'full', component: CompanysettingsComponent},
            {path: 'skills', component: SkillComponent},
            {path: 'users', component: UsersComponent},
            {path: 'applicants', component: ApplicantSettingsComponent},
            {path: 'email', component: EmailsettingsComponent},
            {path: 'google', component: GoogleComponent},
            {path: 'analytics', component: GoogleAnalyticsComponent},
            {path: 'recaptcha', component: GoogleRecaptchaComponent},
            {path: 'interviewIntegration', component: InterviewIntegrationComponent}
        ]
    }
];
export const SettingsRouting = RouterModule.forChild(applicantsRoute);
