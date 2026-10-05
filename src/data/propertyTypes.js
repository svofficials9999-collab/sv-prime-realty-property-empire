// eq = how many "sq yd equivalents" one area unit is worth when pricing.
// Optional per-type fields (missing = neutral, so older types behave exactly as before):
//   comm = commission multiplier, xp = bonus XP per client deal, patience / concede = negotiation shift,
//   locs = only appears in these areas, note = one line shown on the listing.
export const TYPES = {
  plot: { label: 'Open Plot', unit: 'sq yd', size: [150, 300], eq: 1, mult: 1, yield: 0, icon: '🟩' },
  bhk1: { label: '1BHK Flat', unit: 'sq ft', size: [500, 750], eq: 1 / 9, mult: 0.8, yield: 3.4, icon: '🏠', patience: 1, concede: 0.05, note: 'Affordable. Buyers are often first-timers and easier to close.' },
  bhk2: { label: '2BHK Flat', unit: 'sq ft', size: [1050, 1300], eq: 1 / 9, mult: 0.8, yield: 3.0, icon: '🏢' },
  bhk3: { label: '3BHK Flat', unit: 'sq ft', size: [1500, 1900], eq: 1 / 9, mult: 0.8, yield: 2.8, icon: '🏬' },
  villa: { label: 'Villa', unit: 'sq yd', size: [200, 400], eq: 1, mult: 1.8, yield: 2.5, icon: '🏡' },
  luxvilla: { label: 'Luxury Villa', unit: 'sq yd', size: [350, 600], eq: 1, mult: 3.2, yield: 2.2, icon: '🏰', comm: 1.15, xp: 15, patience: -1, concede: -0.08, note: 'High price, higher commission and XP. Buyers are demanding and lose patience sooner.' },
  farm: { label: 'Farm Land', unit: 'sq yd', size: [1500, 3500], eq: 1, mult: 0.03, yield: 1.5, icon: '🌾', comm: 0.9, xp: 10, patience: 1, concede: -0.05, locs: ['tellapur', 'sangareddy'], note: 'Only in far areas. Patient buyers who bargain firmly. Lower commission rate.' },
  office: { label: 'Office', unit: 'sq ft', size: [400, 1200], eq: 1 / 9, mult: 1.5, yield: 4.5, icon: '🏛️', comm: 1.1, xp: 8, note: 'Business buyers. Good rent and a slightly higher commission rate.' },
  shop: { label: 'Commercial Property', unit: 'sq ft', size: [200, 500], eq: 1 / 9, mult: 1.6, yield: 5.0, icon: '🏪' },
};
export const TYPE_IDS = Object.keys(TYPES);
