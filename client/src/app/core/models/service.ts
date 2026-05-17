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

export interface ServicesContent {
  categories: ServiceCategory[];
}
