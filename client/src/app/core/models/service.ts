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

/** A service that has been announced but isn't bookable yet. */
export interface ComingSoonItem {
  id: string;
  name: string;
}

export interface ServicesContent {
  categories: ServiceCategory[];
  comingSoon?: ComingSoonItem[];
}
