import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

// Alle Ansichten werden erst beim Aufruf geladen (lazy), die Seite lädt dabei nie neu
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'groups' },
  {
    path: 'login',
    title: 'Anmelden – Tipprunde',
    loadComponent: () => import('./pages/login/login').then((m) => m.LoginPage),
  },
  {
    path: 'groups',
    title: 'Meine Tippgruppen – Tipprunde',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/groups/groups').then((m) => m.GroupsPage),
  },
  {
    // Einladungsvorschau auch ohne Anmeldung, Beitreten verlangt Login
    path: 'join/:code',
    title: 'Tippgruppe beitreten – Tipprunde',
    loadComponent: () => import('./pages/join/join').then((m) => m.JoinPage),
  },
  {
    path: 'groups/:id/matchday',
    title: 'Spieltag – Tipprunde',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/matchday/matchday').then((m) => m.MatchdayPage),
  },
  {
    path: 'groups/:id/ranking',
    title: 'Rangliste – Tipprunde',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/ranking/ranking').then((m) => m.RankingPage),
  },
  {
    path: 'groups/:id/info',
    title: 'Gruppe – Tipprunde',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/group-info/group-info').then((m) => m.GroupInfoPage),
  },
  {
    path: '**',
    title: 'Seite nicht gefunden – Tipprunde',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFoundPage),
  },
];
