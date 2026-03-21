export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface AdminProject {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  location: string;
  category?: string;
  serviceId?: string;
  serviceTitle?: string;
  images: string[];
  completedDate?: string | null;
}

export interface AdminService {
  id: string;
  title: string;
  description: string;
  icon: string;
  image?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt?: string | null;
}

export interface QuoteRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  projectType: string;
  description: string;
  createdAt?: string | null;
}

export interface DashboardData {
  projects: AdminProject[];
  services: AdminService[];
  contacts: ContactMessage[];
  quotes: QuoteRequest[];
}

export interface SiteTeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  imagePosition?: string;
}

export interface SiteContent {
  id?: string;
  companyName: string;
  companyTagline: string;
  address: string;
  phone: string;
  email: string;
  businessHours: string;
  footerDescription: string;
  facebookUrl: string;
  whatsappUrl: string;
  linkedinUrl: string;
  homeHeroTitle: string;
  homeHeroText: string;
  homeHeroImage: string;
  servicesIntroTitle: string;
  servicesIntroText: string;
  servicesHeroImage: string;
  productsIntroTitle: string;
  productsIntroText: string;
  productsHeroImage: string;
  aboutBannerTitle: string;
  aboutBannerText: string;
  aboutHeroImage: string;
  contactBannerTitle: string;
  contactBannerText: string;
  contactHeroImage: string;
  quoteBannerTitle: string;
  quoteBannerText: string;
  quoteHeroImage: string;
  ctaTitle: string;
  ctaText: string;
  teamMembers: SiteTeamMember[];
}
