import {NgModule} from '@angular/core';
import {InterviewRouting} from './interview.routing';
import {InterviewListComponent} from './interview-list/interview.list.component';
import {InterviewComponent} from './interview.component';
import {FormsModule} from '@angular/forms';
import {RatingModule} from 'ngx-bootstrap';
import {DashboardCommonModule} from '../../common/common.module';
import {MomentModule} from 'angular2-moment';
import {CommonModule} from '@angular/common';

@NgModule({
    imports: [InterviewRouting, FormsModule, RatingModule, DashboardCommonModule, MomentModule, CommonModule],
    declarations: [
        InterviewListComponent,
        InterviewComponent,
    ]
})
export class InterviewModule {
}
