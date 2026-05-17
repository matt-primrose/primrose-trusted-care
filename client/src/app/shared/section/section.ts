import { Component, input } from '@angular/core';

@Component({
  selector: 'app-section',
  template: `
    <section>
      <div class="container">
        @if (heading()) {
          <h2 class="section-heading">{{ heading() }}</h2>
        }
        <ng-content></ng-content>
      </div>
    </section>
  `,
  styles: `
    section {
      padding: 2rem 1.25rem;
    }
    /* Subtle separator above every app-section that isn't the first child of its parent.
       Width matches the container with a small inset on each side so every separator across
       the site renders at the same length on any given viewport. */
    :host:not(:first-child) section::before {
      content: '';
      display: block;
      width: min(1040px, calc(100% - 2rem));
      height: 1px;
      background: var(--color-brand-rosewood, #8e5a5a);
      margin: 0 auto 1.75rem;
      opacity: 0.35;
    }
    .container {
      max-width: 1100px;
      margin: 0 auto;
    }
    .section-heading {
      font-family: var(--font-display, 'Cinzel', serif);
      font-weight: 600;
      letter-spacing: 0.02em;
      color: var(--color-brand-rosewood, #8e5a5a);
      margin: 0 0 1.5rem;
      text-align: center;
    }
    @media (min-width: 768px) {
      section { padding: 3rem 2rem; }
    }
  `,
})
export class Section {
  heading = input<string>('');
}
