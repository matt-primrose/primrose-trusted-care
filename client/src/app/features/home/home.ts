import {
  Component,
  DestroyRef,
  OnInit,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Section } from '../../shared/section/section';
import { Card } from '../../shared/card/card';
import { ContentService } from '../../core/content.service';
import { MetaService } from '../../core/meta.service';
import { ServiceCategory } from '../../core/models/service';
import { Testimonial } from '../../core/models/testimonial';

const CAROUSEL_INTERVAL_MS = 10000;
const CAROUSEL_THRESHOLD = 1; // > this many featured testimonials → switch to carousel (so 2+)

@Component({
  selector: 'app-home',
  imports: [RouterLink, Section, Card],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private content = inject(ContentService);
  private meta = inject(MetaService);
  private platformId = inject(PLATFORM_ID);
  private destroyRef = inject(DestroyRef);

  protected readonly categories = signal<ServiceCategory[]>([]);
  protected readonly testimonialList = signal<Testimonial[]>([]);

  protected readonly useCarousel = computed(
    () => this.testimonialList().length > CAROUSEL_THRESHOLD,
  );
  protected readonly carouselIndex = signal(0);
  protected readonly carouselPaused = signal(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const id = setInterval(() => {
        if (this.useCarousel() && !this.carouselPaused()) {
          this.nextTestimonial();
        }
      }, CAROUSEL_INTERVAL_MS);
      this.destroyRef.onDestroy(() => clearInterval(id));
    }
  }

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
    this.testimonialList.set(testimonials.testimonials);
  }

  nextTestimonial(): void {
    const len = this.testimonialList().length;
    if (len === 0) return;
    this.carouselIndex.update((i) => (i + 1) % len);
  }

  prevTestimonial(): void {
    const len = this.testimonialList().length;
    if (len === 0) return;
    this.carouselIndex.update((i) => (i - 1 + len) % len);
  }

  gotoTestimonial(i: number): void {
    this.carouselIndex.set(i);
  }

  setCarouselPaused(paused: boolean): void {
    this.carouselPaused.set(paused);
  }
}
