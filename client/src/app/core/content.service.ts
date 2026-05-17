import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ServicesContent } from './models/service';
import { FoundersContent } from './models/founder';
import { TestimonialsContent } from './models/testimonial';

@Injectable({ providedIn: 'root' })
export class ContentService {
  private http = inject(HttpClient);

  private servicesCache?: Promise<ServicesContent>;
  private foundersCache?: Promise<FoundersContent>;
  private testimonialsCache?: Promise<TestimonialsContent>;
  private pageCache = new Map<string, Promise<string>>();

  loadServices(): Promise<ServicesContent> {
    this.servicesCache ??= firstValueFrom(
      this.http.get<ServicesContent>('/api/content/services'),
    );
    return this.servicesCache;
  }

  loadFounders(): Promise<FoundersContent> {
    this.foundersCache ??= firstValueFrom(
      this.http.get<FoundersContent>('/api/content/founders'),
    );
    return this.foundersCache;
  }

  loadTestimonials(): Promise<TestimonialsContent> {
    this.testimonialsCache ??= firstValueFrom(
      this.http.get<TestimonialsContent>('/api/content/testimonials'),
    );
    return this.testimonialsCache;
  }

  loadPage(name: string): Promise<string> {
    let cached = this.pageCache.get(name);
    if (!cached) {
      cached = firstValueFrom(
        this.http.get(`/api/content/pages/${name}`, { responseType: 'text' }),
      );
      this.pageCache.set(name, cached);
    }
    return cached;
  }
}
