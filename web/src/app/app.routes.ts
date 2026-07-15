import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { Shell } from './shared/layout/shell';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/auth/login').then((m) => m.Login) },
  { path: 'signup', loadComponent: () => import('./features/auth/signup').then((m) => m.Signup) },
  { path: 'accept-invite/:token', loadComponent: () => import('./features/auth/accept-invite').then((m) => m.AcceptInvite) },
  { path: 'forgot-password', loadComponent: () => import('./features/auth/forgot-password').then((m) => m.ForgotPassword) },
  { path: 'reset-password/:token', loadComponent: () => import('./features/auth/reset-password').then((m) => m.ResetPassword) },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard) },
      { path: 'projects', loadComponent: () => import('./features/projects/project-list').then((m) => m.ProjectList) },
      { path: 'projects/:id', loadComponent: () => import('./features/projects/project-detail').then((m) => m.ProjectDetail) },
      { path: 'tasks', loadComponent: () => import('./features/tasks/task-board').then((m) => m.TaskBoard) },
      { path: 'daily-logs', loadComponent: () => import('./features/daily-logs/daily-log-list').then((m) => m.DailyLogList) },
      { path: 'reports', loadComponent: () => import('./features/reports/reports').then((m) => m.Reports) },
      {
        path: 'team',
        loadComponent: () => import('./features/team/team').then((m) => m.TeamPage),
        canActivate: [roleGuard(['Admin', 'Super Admin', 'Manager'])]
      },
      {
        path: 'admin',
        loadComponent: () => import('./features/admin/admin').then((m) => m.Admin),
        canActivate: [roleGuard(['Admin', 'Super Admin'])]
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
