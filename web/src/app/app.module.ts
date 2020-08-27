
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { HttpClientModule, HttpHeaders, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TagInputModule } from 'ngx-chips';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgDragDropModule } from 'ng-drag-drop';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown/angular2-multiselect-dropdown';
import { MomentModule } from 'angular2-moment';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { NgxFullCalendarModule } from 'ngx-fullcalendar';
import { ChartsModule } from 'ng2-charts';
import { QuillModule } from 'ngx-quill';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing';
import { CallbackPipe, SanitizeHtmlPipe } from './pipe/callback.pipe';

// import { DashboardComponent } from './components/dashboard/dashboard.component';
// import { ContentComponent } from './components/dashboard/content/content.component';

import { LayoutComponent } from './components/layout/layout.component';
import { HeaderComponent } from './components/layout/header/header.component';
import { LeftSideComponent } from './components/layout/left-side/left-side.component';
import { FooterComponent } from './components/layout/footer/footer.component';
import { ControlSidebarComponent } from './components/layout/control-sidebar/control-sidebar.component';

import { LoginComponent } from './components/login/login.component';
import { SearchComponent } from './components/search/search.component';

import { JobsComponent } from './components/jobs/jobs.component';
import { PipelineComponent } from './components/jobs/pipeline/pipeline.component';
import { JobComponent } from './components/jobs/job/job.component';
import { ViewJobsComponent } from './components/jobs/view-jobs/view-jobs.component';
import { ApplicantCardComponent } from './components/jobs/applicantCard/applicant.card.component';
import { ApplicantInfoComponent } from './components/jobs/applicantInfo/applicant.info.component';
import { ApplicantSearchComponent } from './components/jobs/applicantsearch/applicantsearch.component';

import { CompanayviewComponent } from './components/settings/companayview/companayview.component';
import { CompanaiesComponent } from './components/settings/companycreate/companaies.component';
import { DepartmentcreateComponent } from './components/settings/departmentcreate/departmentcreate.component';
import { DepartmentviewComponent } from './components/settings/departmentview/departmentview.component';
import { SkillComponent } from './components/settings/skill/skill.component';
import { JobDetailsComponent } from './components/onboarding/job-details/job-details.component';
import { RegisterApplicantComponent } from './components/onboarding/register-applicant/register-applicant.component';
import { ApplicantsComponent } from './components/applicants/applicants.component';
import { UploadResumeComponent } from './components/applicants/upload-resume/upload-resume.component';
import { SkillsAssessmentComponent } from './components/onboarding/skills-assessment/skills-assessment.component';
import { ThankyouComponent } from './components/onboarding/thankyou/thankyou.component';

import { ConstService } from './services/const.service';
import { AuthInterceptor, AuthGuard, AccountService, RoleGuardService } from './services/account.service';
import { SharedService } from './services/shared.service';
import { DataShareService } from './services/data-share.service';

import { CompanysettingsComponent } from './components/settings/companysettings/companysettings.component';
import { OnboardingLayoutComponent } from './components/onboarding/onboardinglayout.component';
import { CreateComponent } from './components/settings/users/create/create.component';
import { ViewComponent } from './components/settings/users/view/view.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { CommentComponent } from './components/jobs/comment/comment.component';
import { SelectDropdownComponent } from './components/select-dropdown/select-dropdown.component';
import { DatatableComponent } from './components/applicants/datatable';
import { DatatableSortFieldComponent } from './components/applicants/datatable';
import { ModalModule, BsDatepickerModule, TimepickerModule, RatingModule, TypeaheadModule } from 'ngx-bootstrap';
import { PopupComponent } from './components/jobs/popup/popup.component';
import { SearchApplicantComponent } from './components/applicants/search-applicant/search-applicant.component';
import {ToasterModule, ToasterService} from 'angular2-toaster';
import { ApplicantpageComponent } from './components/jobs/applicantpage/applicantpage.component';
import { ApplicantDataService } from './services/applicant-data.service';
import { CreateApplicantComponent } from './components/applicants/create-applicant/create-applicant.component';
import {SafePipe} from './services/senatizerpipe.service';
import { ApplicantResolver } from './resolver/applicant.resolver';
import { ForgetPasswordComponent } from './components/forget-password/forget-password.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ResumeComponent } from './components/resume/resume.component';
import { SchedulerComponent } from './components/interview/scheduler/scheduler.component';
import { InterviewComponent } from './components/interview/interview.component';
import { SettingsComponent } from './components/settings/settings.component';
import { ApplicantSettingsComponent } from './components/settings/applicants/applicant-settings.component';
import { EmailsettingsComponent } from './components/settings/emailsettings/emailsettings.component';
import { GoogleComponent } from './components/settings/google/google.component';
import { InterviewListComponent } from './components/interview/interview-list/interview-list/interview-list.component';
import { InboundComponent } from './components/settings/emailsettings/inbound/inbound.component';
import { OutboundComponent } from './components/settings/emailsettings/outbound/outbound.component';
import { EmailTemplateComponent } from './components/settings/emailsettings/email-template/email-template.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { GoogleAnalyticsComponent } from './components/settings/googleAnalytics/google.analytics.component';
@NgModule({
  declarations: [
    AppComponent,
    CallbackPipe,
    SanitizeHtmlPipe,
    // DashboardComponent,
    HeaderComponent,
    LeftSideComponent,
    FooterComponent,
    ControlSidebarComponent,
    LoginComponent,
    UploadResumeComponent,
    SearchComponent,
    CompanayviewComponent,
    CompanaiesComponent,
    DepartmentcreateComponent,
    DepartmentviewComponent,
    // ContentComponent,
    LayoutComponent,
    PipelineComponent,
    JobComponent,
    ViewJobsComponent,
    SkillComponent,
    ApplicantCardComponent,
    ApplicantInfoComponent,
    JobsComponent,
    ApplicantsComponent,
    JobDetailsComponent,
    RegisterApplicantComponent,
    SkillsAssessmentComponent,
    ThankyouComponent,
    CompanysettingsComponent,
    OnboardingLayoutComponent,
    CreateComponent,
    ViewComponent,
    ResetPasswordComponent,
    CommentComponent,
    SelectDropdownComponent,
    DatatableComponent,
    DatatableSortFieldComponent,
    ApplicantSearchComponent,
    PopupComponent,
    SearchApplicantComponent,
    ApplicantpageComponent,
    CreateApplicantComponent,
    SafePipe,
    ForgetPasswordComponent,
    DashboardComponent,
    ResumeComponent,
    SchedulerComponent,
    InterviewComponent,
    SettingsComponent,
    ApplicantSettingsComponent,
    EmailsettingsComponent,
    GoogleComponent,
    GoogleAnalyticsComponent,
    InterviewListComponent,
    InboundComponent,
    OutboundComponent,
    EmailTemplateComponent
  ],
  imports: [
    ToasterModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    TagInputModule,
    BrowserAnimationsModule,
    NgDragDropModule.forRoot(),
    AngularMultiSelectModule,
    MomentModule,
    PaginationModule.forRoot(),
    ModalModule.forRoot(),
    NgCircleProgressModule.forRoot({
      // set defaults here
      radius: 100,
      outerStrokeWidth: 16,
      innerStrokeWidth: 8,
      outerStrokeColor: '#78C000',
      innerStrokeColor: '#C7E596',
      animationDuration: 300
    }),
    NgxFullCalendarModule,
    BsDatepickerModule.forRoot(),
    TimepickerModule.forRoot(),
    RatingModule.forRoot(),
    TypeaheadModule.forRoot(),
    ChartsModule,
    QuillModule.forRoot(),
    ColorPickerModule
  ],
  entryComponents: [
    ApplicantpageComponent,
    SchedulerComponent,
    UploadResumeComponent,
    InboundComponent,
    OutboundComponent,
    EmailTemplateComponent
  ],
  providers: [ConstService,
    SharedService,
    ApplicantResolver,
    AuthGuard,
    RoleGuardService,
    AccountService,
    ToasterService,
    DataShareService,
    ApplicantDataService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
