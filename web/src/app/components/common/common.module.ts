
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TagInputModule} from 'ngx-chips';

import {NgDragDropModule} from 'ng-drag-drop';
import {AngularMultiSelectModule} from 'angular2-multiselect-dropdown/angular2-multiselect-dropdown';
import {MomentModule} from 'angular2-moment';
import {PaginationModule} from 'ngx-bootstrap/pagination';
import {QuillModule} from 'ngx-quill';
import {CreateApplicantComponent} from './create-applicant/create-applicant.component';
import {SchedulerComponent} from './scheduler/scheduler.component';
import {AddTaskComponent} from './applicant-task/add-task/add.task.component';
import {CancelConformComponent} from './cancelConfromBox/cancel.conform.component';
import {UploadResumeComponent} from './upload-resume/upload-resume.component';
import {AddActivityComponent} from './applicant-activity/add-activity/add.activity.component';
import {JobComponent} from './job/job.component';
import {ApplicantInfoComponent} from './applicantInfo/applicant.info.component';
import {ApplicantTaskComponent} from './applicant-task/applicant.task.component';
import {ApplicantProfileCardComponent} from './applicant-profile-card/applicant.profile.card.component';
import {ApplicantProfileComponent} from './applicant-profile/applicant.profile.component';
import {ApplicantJobsComponent} from './applicant-jobs/applicant.jobs.component';
import {ApplicantActivityComponent} from './applicant-activity/applicant.activity.component';
import {ApplicantInterviewComponent} from './applicant-Interview/applicant.Interview.component';
import {CommentComponent} from './comment/comment.component';
import {DatatableComponent, DatatableSortFieldComponent} from './data-table/datatable';
import {ResumeComponent} from './resume/resume.component';
import {UserCardComponent} from './UserCard/user.card.component';
import {ApplicantCardComponent} from './applicantCard/applicant.card.component';
import {RouterModule} from '@angular/router';
import {BsDatepickerModule, ModalModule, RatingModule, TimepickerModule} from 'ngx-bootstrap';
import {SanitizeHtmlPipe} from '../../pipe/callback.pipe';
import {CommonModule} from '@angular/common';

@NgModule({
    declarations: [
        SchedulerComponent,
        ApplicantInfoComponent,
        DatatableSortFieldComponent,
        UploadResumeComponent,
        AddTaskComponent,
        CancelConformComponent,
        AddActivityComponent,
        CreateApplicantComponent,
        JobComponent,
        AddTaskComponent,
        ApplicantTaskComponent,
        ApplicantProfileComponent,
        ApplicantJobsComponent,
        ApplicantInterviewComponent,
        ApplicantActivityComponent,
        ApplicantProfileCardComponent,
        CommentComponent,
        DatatableComponent,
        ResumeComponent,
        UserCardComponent,
        ApplicantCardComponent,
        SanitizeHtmlPipe
    ],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        TagInputModule,
        NgDragDropModule.forRoot(),
        AngularMultiSelectModule,
        PaginationModule.forRoot(),
        QuillModule.forRoot(),
        RouterModule,
        RatingModule,
        MomentModule,
        BsDatepickerModule,
        TimepickerModule,
        CommonModule,
        ModalModule.forRoot(),
    ],
    exports: [
        SanitizeHtmlPipe,
        SchedulerComponent,
        ApplicantInfoComponent,
        UploadResumeComponent,
        AddTaskComponent,
        CancelConformComponent,
        AddActivityComponent,
        CreateApplicantComponent,
        JobComponent,
        AddTaskComponent,
        ApplicantTaskComponent,
        ApplicantProfileComponent,
        ApplicantJobsComponent,
        ApplicantInterviewComponent,
        ApplicantActivityComponent,
        ApplicantProfileCardComponent,
        CommentComponent,
        DatatableComponent,
        ResumeComponent,
        UserCardComponent,
        ApplicantCardComponent
    ],
    entryComponents: [
        SchedulerComponent,
        UploadResumeComponent,
        AddTaskComponent,
        AddTaskComponent,
        CancelConformComponent,
        AddActivityComponent,
        CreateApplicantComponent,
        JobComponent
    ]
})
export class DashboardCommonModule {
}
