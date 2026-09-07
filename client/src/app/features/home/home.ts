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
import {
  ComingSoonItem,
  ServiceCategory,
  ServicesContent,
} from '../../core/models/service';
import {
  CarouselImage,
  CarouselSlide,
  Testimonial,
} from '../../core/models/testimonial';

const CAROUSEL_INTERVAL_MS = 5000;
const CAROUSEL_THRESHOLD = 1; // carousel kicks in when total slides > this (so 2+)

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
  protected readonly comingSoon = signal<ComingSoonItem[]>([]);
  protected readonly testimonialList = signal<Testimonial[]>([]);
  protected readonly carouselImages = signal<CarouselImage[]>([]);

  /** Interleaves testimonials and images: T, I, T, I, ... longer list's remainder appends at end. */
  protected readonly carouselSlides = computed<CarouselSlide[]>(() => {
    const t = this.testimonialList();
    const i = this.carouselImages();
    const slides: CarouselSlide[] = [];
    const max = Math.max(t.length, i.length);
    for (let n = 0; n < max; n++) {
      if (n < t.length) slides.push({ kind: 'testimonial', data: t[n] });
      if (n < i.length) slides.push({ kind: 'image', data: i[n] });
    }
    return slides;
  });

  protected readonly useCarousel = computed(
    () => this.carouselSlides().length > CAROUSEL_THRESHOLD,
  );
  protected readonly carouselIndex = signal(0);
  protected readonly carouselPaused = signal(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const id = setInterval(() => {
        if (this.useCarousel() && !this.carouselPaused()) {
          this.nextSlide();
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
      this.content
        .loadServices()
        .catch((): ServicesContent => ({ categories: [] })),
      this.content
        .loadTestimonials()
        .catch(() => ({ testimonials: [], images: [] })),
    ]);
    this.categories.set(services.categories);
    this.comingSoon.set(services.comingSoon ?? []);
    this.testimonialList.set(testimonials.testimonials);
    this.carouselImages.set(testimonials.images ?? []);
  }

  nextSlide(): void {
    const len = this.carouselSlides().length;
    if (len === 0) return;
    this.carouselIndex.update((i) => (i + 1) % len);
  }

  prevSlide(): void {
    const len = this.carouselSlides().length;
    if (len === 0) return;
    this.carouselIndex.update((i) => (i - 1 + len) % len);
  }

  gotoSlide(i: number): void {
    this.carouselIndex.set(i);
  }

  setCarouselPaused(paused: boolean): void {
    this.carouselPaused.set(paused);
  }
}
