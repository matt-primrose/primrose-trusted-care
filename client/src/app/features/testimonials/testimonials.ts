import { Component, OnInit, inject, signal } from '@angular/core';
import { Section } from '../../shared/section/section';
import { Card } from '../../shared/card/card';
import { ContentService } from '../../core/content.service';
import { MetaService } from '../../core/meta.service';
import { Testimonial } from '../../core/models/testimonial';

@Component({
  selector: 'app-testimonials',
  imports: [Section, Card],
  templateUrl: './testimonials.html',
  styleUrl: './testimonials.scss',
})
export class Testimonials implements OnInit {
  private content = inject(ContentService);
  private meta = inject(MetaService);

  protected readonly testimonials = signal<Testimonial[]>([]);
  protected readonly loading = signal(true);

  async ngOnInit(): Promise<void> {
    this.meta.set({
      title: 'Testimonials',
      description: 'Hear from families who trust Primrose Trusted Care.',
    });
    try {
      const data = await this.content.loadTestimonials();
      this.testimonials.set(data.testimonials);
    } finally {
      this.loading.set(false);
    }
  }
}
