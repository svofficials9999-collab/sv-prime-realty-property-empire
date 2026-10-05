// ppsy = average price per sq yd (in-game values, not market quotes).
export const LOCATIONS = [
  { id: 'kukatpally', name: 'Kukatpally', ppsy: 55000, minLevel: 1, demand: 60, yield: 3.0 },
  { id: 'miyapur', name: 'Miyapur', ppsy: 50000, minLevel: 1, demand: 58, yield: 3.2 },
  { id: 'kondapur', name: 'Kondapur', ppsy: 80000, minLevel: 3, demand: 66, yield: 3.0 },
  { id: 'narsingi', name: 'Narsingi', ppsy: 65000, minLevel: 3, demand: 62, yield: 2.8 },
  { id: 'gachibowli', name: 'Gachibowli', ppsy: 100000, minLevel: 5, demand: 72, yield: 2.8 },
  { id: 'hitech', name: 'Hitech City', ppsy: 110000, minLevel: 5, demand: 74, yield: 2.7 },
  { id: 'tellapur', name: 'Tellapur', ppsy: 45000, minLevel: 8, demand: 56, yield: 3.4 },
  { id: 'sangareddy', name: 'Sangareddy', ppsy: 18000, minLevel: 8, demand: 50, yield: 3.8 },
  { id: 'fd', name: 'Financial District', ppsy: 85000, minLevel: 12, demand: 68, yield: 2.9 },
];
export const locById = (id) => LOCATIONS.find((l) => l.id === id);
