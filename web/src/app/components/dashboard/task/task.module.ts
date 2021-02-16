import {NgModule} from '@angular/core';
import {TaskRouting} from './task.routing';
import {TaskComponent} from './task.component';
import {FormsModule} from '@angular/forms';
import {DashboardCommonModule} from '../../common/common.module';
import {CommonModule} from '@angular/common';

@NgModule({
    imports: [TaskRouting, FormsModule, DashboardCommonModule, CommonModule],
    declarations: [
        TaskComponent
    ]
})
export class TaskModule {
}
