import { Component } from '@angular/core';

@Component({
  selector: 'app-card',
  template: `<div class="card"><ng-content></ng-content></div>`,
  styles: `
    .card {
      background: var(--color-ui-surface, #fff);
      border: 1px solid var(--color-ui-border, #e8c8d0);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      transition: box-shadow 0.2s ease, transform 0.2s ease;
    }
    .card:hover {
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
      transform: translateY(-2px);
    }
  `,
})
export class Card {}
