import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  {
    path: 'services',
    loadComponent: () =>
      import('./features/services-list/services-list').then((m) => m.ServicesList),
  },
  {
    path: 'services/:id',
    loadComponent: () =>
      import('./features/service-detail/service-detail').then((m) => m.ServiceDetail),
  },
  {
    path: 'about',
    loadComponent: () => import('./features/about/about').then((m) => m.About),
  },
  {
    path: 'testimonials',
    loadComponent: () =>
      import('./features/testimonials/testimonials').then((m) => m.Testimonials),
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/contact/contact').then((m) => m.Contact),
  },
  {
    path: 'become-a-provider',
    loadComponent: () =>
      import('./features/become-provider/become-provider').then((m) => m.BecomeProvider),
  },
  { path: '**', redirectTo: '' },
];
