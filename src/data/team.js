// Phase 2: staff and vehicles. Add-only data. Money is integer rupees.
export const STAFF = [
  { id: 'sales', name: 'Sales Agent', icon: '🤝', weekly: 3000, effect: 'Buyers concede a little more', per: '+4% concession' },
  { id: 'marketer', name: 'Digital Marketer', icon: '📣', weekly: 2500, effect: 'More leads each week', per: '+6% lead chance' },
  { id: 'visitexec', name: 'Site Visit Executive', icon: '🚗', weekly: 2000, effect: 'Better site visits', per: '+6 visit score' },
  { id: 'propmgr', name: 'Property Manager', icon: '🔑', weekly: 2500, effect: 'Higher rental income', per: '+8% rent' },
  { id: 'paperwork', name: 'Paperwork Assistant', icon: '📄', weekly: 3500, effect: 'Smoother deal closing', per: '+0.1% commission' },
  { id: 'accountant', name: 'Accountant', icon: '🧮', weekly: 3000, effect: 'Lower staff salaries', per: '-15% salary cost' },
];
export const VEHICLES = [
  { id: 'car', tier: 1, name: 'Basic Car', icon: '🚗', price: 600000, minLevel: 2, visit: 3, note: 'Opens far areas: Tellapur, Sangareddy' },
  { id: 'suv', tier: 2, name: 'SUV', icon: '🚙', price: 1800000, minLevel: 4, visit: 6, note: 'Opens Financial District' },
  { id: 'luxury', tier: 3, name: 'Luxury Car', icon: '🏎️', price: 4500000, minLevel: 8, visit: 9, note: 'Impresses premium buyers' },
  { id: 'psuv', tier: 4, name: 'Premium SUV', icon: '🚘', price: 9000000, minLevel: 12, visit: 12, note: 'Top comfort for long drives' },
  { id: 'heli', tier: 5, name: 'Helicopter', icon: '🚁', price: 25000000, minLevel: 18, visit: 15, note: 'The best site visit experience' },
];
export const HIRE_WEEKS = 8; // one-time hiring fee = 8 weeks of salary
