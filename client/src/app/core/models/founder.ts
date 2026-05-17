export interface Founder {
  id: string;
  name: string;
  role: string;
  photoRef: string;
  bio: string;
}

export interface FoundersContent {
  founders: Founder[];
}
