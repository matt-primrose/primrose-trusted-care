import { Component, input } from '@angular/core';

@Component({
  selector: 'app-section',
  template: `
    <section [class.tinted]="tinted()">
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
      padding: 3rem 1.25rem;
    }
    section.tinted {
      background: var(--color-brand-blush, #f8dce5);
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
      section { padding: 4.5rem 2rem; }
    }
  `,
})
export class Section {
  heading = input<string>('');
  tinted = input<boolean>(false);
}
