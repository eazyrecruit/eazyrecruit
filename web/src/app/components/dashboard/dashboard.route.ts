import {Routes, RouterModule} from '@angular/router';
import {DashboardComponent} from './dashboard.component';
import {LayoutComponent} from './layout/layout.component';
import {AuthGuard, RoleGuardService} from '../../services/account.service';

const dashboardRoutes: Routes = [
    {
        path: '', component: LayoutComponent,
        children: [
            {path: '', redirectTo: 'home', pathMatch: 'full'},
            {
                path: 'home',
                component: DashboardComponent,
                canActivate: [RoleGuardService],
                data: {expectedRole: ['interviewer', 'admin', 'hr']}
            },
            {
                path: 'jobs',
                children:
                    [
                        {
                            path: '',
                            loadChildren: () => import('./jobs/jobs.module').then(m => m.JobsModule)
                        },
                    ],
                canActivate: [RoleGuardService], data: {expectedRole: ['admin', 'hr']}
            },
            {
                path: 'profile',
                children:
                    [
                        {
                            path: '',
                            loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule)
                        },
                    ],
                canActivate: [AuthGuard]
            },
            {
                path: 'database', children:
                    [
                        {
                            path: '',
                            loadChildren: () => import('./database/database.module').then(m => m.DatabaseModule)
                        },
                    ], canActivate: [RoleGuardService], data: {expectedRole: ['admin', 'hr']}
            },
            {
                path: 'applicants', children:
                    [
                        {
                            path: '',
                            loadChildren: () => import('./applicants/applicants.module').then(m => m.ApplicantModule)
                        },
                    ], canActivate: [RoleGuardService], data: {expectedRole: ['admin', 'hr']}
            },
            {
                path: 'referred-applicants',
                children:
                    [
                        {
                            path: '',
                            loadChildren: () =>
                                import('./referred-applicant/referred.applicant.module').then(m => m.ReferredApplicantModule)
                        },
                    ],
                canActivate: [AuthGuard]
            },
            {
                path: 'tasks',
                children:
                    [
                        {
                            path: '',
                            loadChildren: () =>
                                import('./task/task.module').then(m => m.TaskModule)
                        },
                    ],
                canActivate: [AuthGuard]
            },
            {
                path: 'settings', children:
                    [
                        {
                            path: '',
                            loadChildren: () => import('./settings/settings.module').then(m => m.SettingsModule)
                        },
                    ], canActivate: [RoleGuardService], data: {expectedRole: ['admin']}
            },
            {
                path: 'interview',
                children:
                    [
                        {
                            path: '',
                            loadChildren: () => import('./interview/interview.module').then(m => m.InterviewModule)
                        },
                    ],
                data: {expectedRole: ['interviewer', 'admin', 'hr']}
            },
        ], canActivate: [AuthGuard],
    },
];

export const DashboardRouting = RouterModule.forChild(dashboardRoutes);
