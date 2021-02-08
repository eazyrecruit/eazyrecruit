import {NgModule} from '@angular/core';
import {ProfileRouting} from './profile.routing';
import {ProfileComponent} from "./profile.component";
import {ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";

@NgModule({
    imports: [ProfileRouting, ReactiveFormsModule, CommonModule],
    declarations: [
        ProfileComponent
    ]
})
export class ProfileModule {
}
