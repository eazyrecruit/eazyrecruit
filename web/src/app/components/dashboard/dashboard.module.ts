import { NgModule } from '@angular/core';
import { DashboardRouting } from './dashboard.route';
import {DashboardComponent} from './dashboard.component';
import {LeftSideComponent} from './layout/left-side/left-side.component';
import {LayoutComponent} from './layout/layout.component';
import {CommonModule} from '@angular/common';
import {NgxFullCalendarModule} from 'ngx-fullcalendar';
import {ChartsModule} from 'ng2-charts';
@NgModule({
    imports: [DashboardRouting, CommonModule, NgxFullCalendarModule, ChartsModule],
  declarations: [LayoutComponent, LeftSideComponent, DashboardComponent],
  bootstrap: [DashboardComponent],
})
export class DashboardModule {}
