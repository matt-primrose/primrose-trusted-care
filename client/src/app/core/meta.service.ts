import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class MetaService {
  private title = inject(Title);
  private meta = inject(Meta);

  set({ title, description }: { title: string; description?: string }): void {
    const fullTitle = `${title} | Primrose Trusted Care`;
    this.title.setTitle(fullTitle);
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    if (description) {
      this.meta.updateTag({ name: 'description', content: description });
      this.meta.updateTag({ property: 'og:description', content: description });
    }
  }
}
