// eq = how many "sq yd equivalents" one area unit is worth when pricing.
export const TYPES = {
  plot: { label: 'Open Plot', unit: 'sq yd', size: [150, 300], eq: 1, mult: 1, yield: 0, icon: '🟩' },
  bhk2: { label: '2BHK Flat', unit: 'sq ft', size: [1050, 1300], eq: 1 / 9, mult: 0.8, yield: 3.0, icon: '🏢' },
  bhk3: { label: '3BHK Flat', unit: 'sq ft', size: [1500, 1900], eq: 1 / 9, mult: 0.8, yield: 2.8, icon: '🏬' },
  villa: { label: 'Villa', unit: 'sq yd', size: [200, 400], eq: 1, mult: 1.8, yield: 2.5, icon: '🏡' },
  shop: { label: 'Commercial Shop', unit: 'sq ft', size: [200, 500], eq: 1 / 9, mult: 1.6, yield: 5.0, icon: '🏪' },
};
export const TYPE_IDS = Object.keys(TYPES);
