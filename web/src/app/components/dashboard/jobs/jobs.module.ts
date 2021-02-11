import {NgModule} from '@angular/core';
import {JobsRouting} from './jobs.routing';
import {PipelineListComponent} from './pipeline/listView/pipeline.list.component';
import {PipelineGridComponent} from './pipeline/gridView/pipeline.grid.component';
import {PipelineComponent} from './pipeline/pipeline.component';
import {JobsComponent} from './jobs.component';
import {CommonModule} from '@angular/common';
import {BsDatepickerModule, PaginationModule} from 'ngx-bootstrap';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {DashboardCommonModule} from '../../common/common.module';
import {NgDragDropModule} from 'ng-drag-drop';
@NgModule({
    imports: [JobsRouting, CommonModule, PaginationModule, FormsModule,
        BsDatepickerModule, DashboardCommonModule, NgDragDropModule, ReactiveFormsModule],
    declarations: [
        JobsComponent,
        PipelineComponent,
        PipelineListComponent,
        PipelineGridComponent
    ]
})
export class JobsModule {
}
