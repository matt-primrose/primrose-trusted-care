export interface ServiceItem {
  id: string;
  name: string;
  tagline?: string;
  description: string;
  imageRef?: string;
  bookingNotes?: string;
  active: boolean;
}

export interface ServiceCategory {
  id: string;
  name: string;
  tagline?: string;
  iconRef?: string;
  services: ServiceItem[];
}

export interface ComingSoonImage {
  src: string;
  alt: string;
}

/** A service that has been announced but isn't bookable yet. */
export interface ComingSoonItem {
  id: string;
  name: string;
  /** Optional artwork; the home banner flanks the name with the first two. */
  images?: ComingSoonImage[];
}

export interface ServicesContent {
  categories: ServiceCategory[];
  comingSoon?: ComingSoonItem[];
}
