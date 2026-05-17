export interface Testimonial {
  id: string;
  quote: string;
  attribution: string;
  location?: string;
  featured: boolean;
}

export interface TestimonialsContent {
  testimonials: Testimonial[];
}
