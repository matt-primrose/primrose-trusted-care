import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Section } from '../../shared/section/section';
import { Card } from '../../shared/card/card';
import { ContentService } from '../../core/content.service';
import { MetaService } from '../../core/meta.service';
import { ServiceCategory } from '../../core/models/service';
import { Testimonial } from '../../core/models/testimonial';

@Component({
  selector: 'app-home',
  imports: [RouterLink, Section, Card],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private content = inject(ContentService);
  private meta = inject(MetaService);

  protected readonly categories = signal<ServiceCategory[]>([]);
  protected readonly featuredTestimonials = signal<Testimonial[]>([]);

  async ngOnInit(): Promise<void> {
    this.meta.set({
      title: 'Trusted, vetted family care',
      description:
        "Primrose Trusted Care offers vetted nannies, sitters, mother's helpers, and pet sitters — every provider is background-checked and credential-verified.",
    });

    const [services, testimonials] = await Promise.all([
      this.content.loadServices().catch(() => ({ categories: [] })),
      this.content.loadTestimonials().catch(() => ({ testimonials: [] })),
    ]);
    this.categories.set(services.categories);
    this.featuredTestimonials.set(testimonials.testimonials.filter((t) => t.featured));
  }
}
