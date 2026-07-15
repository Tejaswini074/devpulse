import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { Shell } from './shared/layout/shell';
import { Login } from './features/auth/login';
import { Signup } from './features/auth/signup';
import { AcceptInvite } from './features/auth/accept-invite';
import { ForgotPassword } from './features/auth/forgot-password';
import { ResetPassword } from './features/auth/reset-password';
import { Dashboard } from './features/dashboard/dashboard';
import { ProjectList } from './features/projects/project-list';
import { ProjectDetail } from './features/projects/project-detail';
import { TaskBoard } from './features/tasks/task-board';
import { DailyLogList } from './features/daily-logs/daily-log-list';
import { Reports } from './features/reports/reports';
import { TeamPage } from './features/team/team';
import { Admin } from './features/admin/admin';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  { path: 'accept-invite/:token', component: AcceptInvite },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'reset-password/:token', component: ResetPassword },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: Dashboard },
      { path: 'projects', component: ProjectList },
      { path: 'projects/:id', component: ProjectDetail },
      { path: 'tasks', component: TaskBoard },
      { path: 'daily-logs', component: DailyLogList },
      { path: 'reports', component: Reports },
      { path: 'team', component: TeamPage, canActivate: [roleGuard(['Admin', 'Super Admin', 'Manager'])] },
      { path: 'admin', component: Admin, canActivate: [roleGuard(['Admin', 'Super Admin'])] }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
