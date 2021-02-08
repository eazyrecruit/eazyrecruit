import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {LoginComponent} from './components/account/login/login.component';
import {ResetPasswordComponent} from './components/account/reset-password/reset-password.component';
import {ForgetPasswordComponent} from './components/account/forget-password/forget-password.component';
import {AuthGuard} from './services/account.service';

@NgModule({
    imports: [
        RouterModule.forRoot([
            {path: 'resetpassword/:otp', component: ResetPasswordComponent},
            {path: 'forgetpassword', component: ForgetPasswordComponent},
            {path: 'login', component: LoginComponent},
            {
                path: '',
                children:
                    [
                        {
                            path: '',
                            loadChildren: () => import('./components/dashboard/dashboard.module').then(m => m.DashboardModule)
                        },
                    ],
                /*     loadChildren: './components/dashboard/dashboard.module.ts#DashboardModule',*/
                canActivate: [AuthGuard]
            },
            {path: '**', redirectTo: 'dashboard', pathMatch: 'full'},
        ]),
    ]
})

export class AppRoutingModule {
}
