/**
 * Client Domain Constants & Enums
 */

export const SECTOR_CONFIG = {
  FinTech: ['Payments', 'Lending', 'Neobanking', 'InsurTech', 'WealthTech', 'Crypto & Web3', 'Capital Markets'],
  HealthTech: ['Telemedicine', 'Medical Devices', 'Digital Therapeutics', 'BioTech', 'Health AI', 'Care Management'],
  'AI / Machine Learning': ['Generative AI', 'Computer Vision', 'NLP', 'Robotics & Automation', 'LLM Infrastructure'],
  'Enterprise SaaS': ['CRM & Sales', 'ERP & Supply Chain', 'DevTools & Infrastructure', 'HRTech', 'Cybersecurity', 'MarTech'],
  ClimateTech: ['Clean Energy', 'Carbon Management', 'AgriTech', 'Circular Economy', 'EV & Mobility'],
  EdTech: ['K-12 Education', 'Higher Ed', 'Upskilling & Corporate', 'EdTech Hardware'],
  'E-Commerce & Retail': ['D2C Brands', 'Marketplaces', 'Social Commerce', 'Q-Commerce', 'Retail Tech'],
  Logistics: ['Freight & Supply Chain', 'Last-Mile Delivery', 'Fleet Management', 'Warehousing'],
  Consumer: ['Gaming & Esports', 'Social Media', 'Content & Media', 'FinTech for Consumers'],
  Other: ['General Tech', 'Hardware', 'DeepTech', 'SpaceTech'],
};

export const SECTORS = Object.keys(SECTOR_CONFIG);

export const STAGES = ['Idea', 'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C+', 'Growth'];

export const BUSINESS_MODELS = ['B2B', 'B2C', 'B2B2C', 'D2C', 'Marketplace', 'SaaS', 'Subscription', 'Transactional', 'Other'];

export const FUNDRAISING_STATUSES = ['Not Raising', 'Preparing to Raise', 'Currently Raising', 'Recently Funded'];

export const PROFILE_VISIBILITY = ['Private', 'Investors Only'];

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'SGD'];
