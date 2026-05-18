export interface Testimonial {
  id: string;
  quote: string;
  attribution: string;
  location?: string;
}

export interface CarouselImage {
  id: string;
  src: string;
  alt: string;
}

export interface TestimonialsContent {
  testimonials: Testimonial[];
  /** Optional companion photos for the home-page carousel. Not shown on /testimonials. */
  images?: CarouselImage[];
}

/** Discriminated union for a single slide in the home-page carousel. */
export type CarouselSlide =
  | { kind: 'testimonial'; data: Testimonial }
  | { kind: 'image'; data: CarouselImage };
