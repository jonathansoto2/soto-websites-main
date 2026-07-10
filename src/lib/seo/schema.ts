import { brand } from '@/data/site';

export const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: brand.name,
  url: brand.url,
  areaServed: ['Oxnard', 'Ventura County', 'Camarillo', 'Ventura', 'Port Hueneme'],
  description: brand.description,
  email: brand.email,
  telephone: brand.phone,
  address: { '@type': 'PostalAddress', addressLocality: 'Oxnard', addressRegion: 'CA', addressCountry: 'US' },
  serviceType: ['Website Design', 'Website Management', 'Email Marketing', 'Google Business Profile Optimization'],
};
