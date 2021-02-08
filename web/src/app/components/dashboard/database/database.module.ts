import {NgModule} from '@angular/core';
import {DatabaseRouting} from './database.routing';
import {DatabaseComponent} from './database.component';
import {FormsModule} from "@angular/forms";
import {DashboardCommonModule} from "../../common/common.module";
import {CommonModule} from "@angular/common";

@NgModule({
    imports: [DatabaseRouting, FormsModule, DashboardCommonModule, CommonModule],
    declarations: [
        DatabaseComponent
    ]
})
export class DatabaseModule {
}
