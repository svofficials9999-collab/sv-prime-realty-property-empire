// Schematic map (not to scale). Positions on a 360 x 300 canvas. Roads link neighbouring areas.
export const NODES = {
  sangareddy: [48, 44], miyapur: [120, 62], kukatpally: [196, 62], hitech: [262, 112], kondapur: [190, 150],
  tellapur: [60, 160], gachibowli: [236, 202], narsingi: [128, 226], fd: [210, 268],
};
export const ROADS = [
  ['sangareddy', 'miyapur'], ['miyapur', 'kukatpally'], ['kukatpally', 'hitech'], ['kukatpally', 'kondapur'], ['hitech', 'kondapur'],
  ['hitech', 'gachibowli'], ['kondapur', 'gachibowli'], ['kondapur', 'narsingi'], ['narsingi', 'tellapur'], ['miyapur', 'tellapur'],
  ['gachibowli', 'fd'], ['narsingi', 'fd'],
];
export const STATUS = {
  available: { label: 'Available', color: '#4f8cff', chip: 'blue' },
  listed: { label: 'Your listing', color: '#f0c04a', chip: 'gold' },
  owned: { label: 'Owned', color: '#3ccf7a', chip: 'green' },
  sold: { label: 'Sold', color: '#8a93a6', chip: '' },
};
export const statusOf = (p) => (p.status === 'market' ? 'available' : p.status === 'listed' ? 'listed' : p.status === 'owned' ? 'owned' : p.status === 'sold' ? 'sold' : null);
