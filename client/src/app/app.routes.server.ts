import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // All routes render on every request (runtime SSR) — matches v1 SSR decision.
  // Dynamic routes like /services/:id are handled by this catch-all without
  // needing a static parameter list.
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
