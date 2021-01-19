import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {LoginComponent} from './components/login/login.component';
import {LayoutComponent} from './components/layout/layout.component';
import {PipelineComponent} from './components/jobs/pipeline/pipeline.component';
import {AuthGuard, RoleGuardService} from './services/account.service';
import {SkillComponent} from './components/settings/skill/skill.component';
import {JobsComponent} from './components/jobs/jobs.component';
import {ApplicantsComponent} from './components/applicants/applicants.component';
import {CompanysettingsComponent} from './components/settings/companysettings/companysettings.component';
import {ViewComponent} from './components/settings/users/view/view.component';
import {ResetPasswordComponent} from './components/reset-password/reset-password.component';
import {ApplicantpageComponent} from './components/applicants/applicantpage/applicantpage.component';
import {ForgetPasswordComponent} from './components/forget-password/forget-password.component';
import {DashboardComponent} from './components/dashboard/dashboard.component';
import {InterviewComponent} from './components/interview/interview.component';
import {SettingsComponent} from './components/settings/settings.component';
import {ApplicantSettingsComponent} from './components/settings/applicants/applicant-settings.component';
import {EmailsettingsComponent} from './components/settings/emailsettings/emailsettings.component';
import {GoogleComponent} from './components/settings/google/google.component';
import {GoogleAnalyticsComponent} from './components/settings/googleAnalytics/google.analytics.component';
import {InterviewListComponent} from './components/interview/interview-list/interview.list.component';
import {ProfileComponent} from './components/profile/profile.component';
import {DatabaseComponent} from './components/database/database.component';
import {GoogleRecaptchaComponent} from './components/settings/googleRecaptcha/google.recaptcha.component';
import {ReferredApplicantComponent} from './components/referred-applicant/referred.applicant.component';
import {ReferredApplicantJobComponent} from "./components/referred-applicant/referred-applicant-Job/referred.applicant.job.component";
import {InterviewIntegrationComponent} from "./components/settings/Interview-Integration/interview.integration.component";

@NgModule({
    imports: [
        RouterModule.forRoot([
            {path: 'resetpassword/:otp', component: ResetPasswordComponent},
            {path: 'forgetpassword', component: ForgetPasswordComponent},
            {path: 'login', component: LoginComponent},
            // we added role to each path, now expecting to match role first before loading that route.
            {
                path: '', component: LayoutComponent,
                children: [
                    {path: '', redirectTo: 'home', pathMatch: 'full'},
                    {
                        path: 'home',
                        component: DashboardComponent,
                        canActivate: [RoleGuardService],
                        data: {expectedRole: ['interviewer', 'admin', 'hr']}
                    },
                    {
                        path: 'jobs', children: [
                            {path: '', component: JobsComponent},
                            {path: 'pipeline/:jobId', component: PipelineComponent},
                        ], canActivate: [RoleGuardService], data: {expectedRole: ['admin', 'hr']}
                    },
                    {
                        path: 'profile',
                        component: ProfileComponent,
                        canActivate: [AuthGuard]
                    },
                    {
                        path: 'database', children: [
                            {path: '', pathMatch: 'full', component: DatabaseComponent},
                            {path: 'add/job/:jobId/:pipelineId', component: DatabaseComponent}
                        ], canActivate: [RoleGuardService], data: {expectedRole: ['admin', 'hr']}
                    },
                    {
                        path: 'applicants', children: [
                            {path: '', pathMatch: 'full', component: ApplicantsComponent},
                            {path: ':id', component: ApplicantpageComponent}
                        ], canActivate: [RoleGuardService], data: {expectedRole: ['admin', 'hr']}
                    },
                    {
                        path: 'referred-applicants',
                        children: [
                            {path: '', pathMatch: 'full', component: ReferredApplicantComponent},
                            {path: 'job', component: ReferredApplicantJobComponent},
                            {path: 'add/job/:jobId', component: ReferredApplicantComponent}
                        ],
                        canActivate: [AuthGuard]
                    },
                    {
                        path: 'settings', component: SettingsComponent, children: [
                            {path: '', pathMatch: 'full', component: CompanysettingsComponent},
                            {path: 'skills', component: SkillComponent},
                            {path: 'users', component: ViewComponent},
                            {path: 'applicants', component: ApplicantSettingsComponent},
                            {path: 'email', component: EmailsettingsComponent},
                            {path: 'google', component: GoogleComponent},
                            {path: 'analytics', component: GoogleAnalyticsComponent},
                            {path: 'recaptcha', component: GoogleRecaptchaComponent},
                            {path: 'interviewIntegration', component: InterviewIntegrationComponent}
                        ], canActivate: [RoleGuardService], data: {expectedRole: ['admin']}
                    },
                    {
                        path: 'interviews',
                        component: InterviewListComponent,
                        data: {expectedRole: ['interviewer', 'admin', 'hr']}
                    },
                    {
                        path: 'interview/:interviewId',
                        component: InterviewComponent,
                        data: {expectedRole: ['interviewer', 'admin', 'hr']}
                    },
                ], canActivate: [AuthGuard],
            },
            {path: '**', redirectTo: 'home', pathMatch: 'full'},
        ]),
    ],
    declarations: [],
    exports: [RouterModule]
})

export class AppRoutingModule {
}
