import {NgModule} from '@angular/core';
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
import {SettingsRouting} from './settings.routing';
import {CompaniesComponent} from './companycreate/companies.component';
import {EmailTemplateComponent} from './emailsettings/email-template/email-template.component';
import {InboundComponent} from './emailsettings/inbound/inbound.component';
import {OutboundComponent} from './emailsettings/outbound/outbound.component';
import {ToasterModule} from 'angular2-toaster';
import {ReactiveFormsModule} from '@angular/forms';
import {ColorPickerModule} from 'ngx-color-picker';
import {DashboardCommonModule} from '../../common/common.module';
import {CommonModule} from '@angular/common';
import {ModalModule} from 'ngx-bootstrap';

@NgModule({
    imports: [SettingsRouting, CommonModule, ToasterModule, ReactiveFormsModule, ModalModule.forRoot(),
        ColorPickerModule, DashboardCommonModule],
    declarations: [
        SettingsComponent,
        CompanysettingsComponent,
        SkillComponent,
        UsersComponent,
        ApplicantSettingsComponent,
        EmailsettingsComponent,
        GoogleComponent,
        GoogleAnalyticsComponent,
        GoogleRecaptchaComponent,
        InterviewIntegrationComponent,
        CompaniesComponent,
        EmailTemplateComponent, InboundComponent, OutboundComponent
    ],
    entryComponents: [EmailTemplateComponent, InboundComponent, OutboundComponent]
})
export class SettingsModule {
}
