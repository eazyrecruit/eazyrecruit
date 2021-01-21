import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import {TagInputModule} from 'ngx-chips';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgDragDropModule} from 'ng-drag-drop';
import {AngularMultiSelectModule} from 'angular2-multiselect-dropdown/angular2-multiselect-dropdown';
import {MomentModule} from 'angular2-moment';
import {PaginationModule} from 'ngx-bootstrap/pagination';
import {NgCircleProgressModule} from 'ng-circle-progress';
import {NgxFullCalendarModule} from 'ngx-fullcalendar';
import {ChartsModule} from 'ng2-charts';
import {QuillModule} from 'ngx-quill';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app.routing';
import {CallbackPipe} from './pipe/callback.pipe';
import {LoginComponent} from './components/account/login/login.component';
import {ConstService} from './services/const.service';
import {AuthInterceptor, AuthGuard, AccountService, RoleGuardService} from './services/account.service';
import {SharedService} from './services/shared.service';
import {DataShareService} from './services/data-share.service';
import {ResetPasswordComponent} from './components/account/reset-password/reset-password.component';
import {ModalModule, BsDatepickerModule, TimepickerModule, RatingModule, TypeaheadModule} from 'ngx-bootstrap';
import {ToasterModule, ToasterService} from 'angular2-toaster';
import {ApplicantDataService} from './services/applicant-data.service';
import {SafePipe} from './services/senatizerpipe.service';
import {ForgetPasswordComponent} from './components/account/forget-password/forget-password.component';
import {ColorPickerModule} from 'ngx-color-picker';
import {ApplicantActivityService} from './components/common/applicant-activity/applicant-activity.service';
import {RouterModule} from '@angular/router';

@NgModule({
    declarations: [
        AppComponent,
        CallbackPipe,
        LoginComponent,
        ResetPasswordComponent,
        SafePipe,
        ForgetPasswordComponent
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
        ColorPickerModule,
        RouterModule
    ],
    providers: [ConstService,
        SharedService,
        AuthGuard,
        ApplicantActivityService,
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
export class AppModule {
}
