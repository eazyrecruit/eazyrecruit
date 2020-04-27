
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { SearchComponent } from './components/search/search.component';
import { LayoutComponent } from './components/layout/layout.component';
import { PipelineComponent } from './components/jobs/pipeline/pipeline.component';
import { AuthGuard, RoleGuardService } from './services/account.service';
import { JobComponent } from './components/jobs/job/job.component';
import { ViewJobsComponent } from './components/jobs/view-jobs/view-jobs.component';
import { SkillComponent } from './components/settings/skill/skill.component';
import { CompanaiesComponent } from './components/settings/companycreate/companaies.component';
import { CompanayviewComponent } from './components/settings/companayview/companayview.component';
import { DepartmentcreateComponent } from './components/settings/departmentcreate/departmentcreate.component';
import { DepartmentviewComponent } from './components/settings/departmentview/departmentview.component';
import { JobsComponent } from './components/jobs/jobs.component';
import { ApplicantsComponent } from './components/applicants/applicants.component';
import { UploadResumeComponent } from './components/applicants/upload-resume/upload-resume.component';
import { JobDetailsComponent } from './components/onboarding/job-details/job-details.component';
import { RegisterApplicantComponent } from './components/onboarding/register-applicant/register-applicant.component';
import { SkillsAssessmentComponent } from './components/onboarding/skills-assessment/skills-assessment.component';
import { ThankyouComponent } from './components/onboarding/thankyou/thankyou.component';
import { CompanysettingsComponent } from './components/settings/companysettings/companysettings.component';
import { OnboardingLayoutComponent } from './components/onboarding/onboardinglayout.component';
import { CreateComponent } from './components/settings/users/create/create.component';
import { ViewComponent } from './components/settings/users/view/view.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { ApplicantSearchComponent } from './components/jobs/applicantsearch/applicantsearch.component';
import { SelectDropdownComponent } from './components/select-dropdown/select-dropdown.component';
import { SearchApplicantComponent } from './components/applicants/search-applicant/search-applicant.component';
import { ApplicantpageComponent } from './components/jobs/applicantpage/applicantpage.component';
import { CreateApplicantComponent } from './components/applicants/create-applicant/create-applicant.component';
import { ApplicantResolver } from './resolver/applicant.resolver';
import { ForgetPasswordComponent } from './components/forget-password/forget-password.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { InterviewComponent } from './components/interview/interview.component';
import { SettingsComponent } from './components/settings/settings.component';
import { ApplicantSettingsComponent } from './components/settings/applicants/applicant-settings.component';
import { EmailsettingsComponent } from './components/settings/emailsettings/emailsettings.component';
import { GoogleComponent } from './components/settings/google/google.component';
import { InterviewListComponent } from './components/interview/interview-list/interview-list/interview-list.component';

@NgModule({
  imports: [
    RouterModule.forRoot([
      { path: 'resetpassword/:otp', component: ResetPasswordComponent },
      { path: 'forgetpassword', component: ForgetPasswordComponent },
      {
        path: 'onboarding', component: OnboardingLayoutComponent, children: [
          { path: 'job/:id', component: JobDetailsComponent },
          { path: 'register/:id', component: RegisterApplicantComponent },
          { path: 'skill/:id/:applicantId', component: SkillsAssessmentComponent },
          { path: 'thankyou', component: ThankyouComponent }]
      },
      { path: 'login', component: LoginComponent },
      // we added role to each path, now expecting to match role first before loading that route.
      {
        path: '', component: LayoutComponent,
        children: [
          { path: '', redirectTo: 'home', pathMatch: 'full' },
          { path: 'home', component: DashboardComponent, canActivate: [RoleGuardService], data: { expectedRole: ['user', 'admin'] } },
          {
            path: 'jobs', children: [
              { path: '', component: JobsComponent },
              { path: 'create', component: JobComponent },
              { path: 'pipeline/:jobId', component: PipelineComponent },
            ], canActivate: [RoleGuardService], data: { expectedRole: ['admin'] }
          },
          {
            path: 'applicants', children: [
              { path: '', pathMatch: 'full', component: ApplicantsComponent },
              { path: 'search-applicant', component: ApplicantSearchComponent },
              { path: 'upload', component: RegisterApplicantComponent },
              { path: 'applicant/:applicantId', component: PipelineComponent },
              { path: 'add/job/:jobId/:pipelineId', component:  ApplicantsComponent},
              //{ path: 'search', component:  SearchApplicantComponent},
              { path: 'create', component: CreateApplicantComponent },
              { path: ':id', resolve: { applicant: ApplicantResolver }, component: ApplicantpageComponent }
            ], canActivate: [RoleGuardService], data: { expectedRole: ['admin'] }
          },
          {
            path: 'settings', component: SettingsComponent, children: [
              { path: '', pathMatch: 'full', component: CompanysettingsComponent },
              { path: 'skills', component: SkillComponent },
              { path: 'users', component: ViewComponent },
              { path: 'applicants', component: ApplicantSettingsComponent },
              { path: 'email', component: EmailsettingsComponent },
              { path: 'google', component: GoogleComponent }
            ], canActivate: [RoleGuardService], data: { expectedRole: ['admin'] }
          },
          { path: 'interviews', component: InterviewListComponent, data: { expectedRole: ['user', 'admin'] } },
          { path: 'interview/:interviewId', component: InterviewComponent, data: { expectedRole: ['user', 'admin'] } },
          { path: 'search', component: SearchComponent, canActivate: [RoleGuardService], data: { expectedRole: ['admin'] } },
          { path: 'createjob', component: JobComponent, canActivate: [RoleGuardService], data: { expectedRole: ['admin'] } },
          { path: 'viewjobs', component: ViewJobsComponent, canActivate: [RoleGuardService], data: { expectedRole: ['admin'] } }
        ], canActivate: [AuthGuard],
      },
      { path: '**', redirectTo: 'home', pathMatch: 'full' },
    ]),
  ],
  declarations: [],
  exports: [RouterModule]
})

export class AppRoutingModule { }
