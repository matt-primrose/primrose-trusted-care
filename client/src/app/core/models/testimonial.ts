export interface Testimonial {
  id: string;
  quote: string;
  attribution: string;
  location?: string;
}

export interface TestimonialsContent {
  testimonials: Testimonial[];
}
