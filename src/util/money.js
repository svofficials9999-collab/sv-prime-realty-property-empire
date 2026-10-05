export const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
const trim = (x) => String(+x.toFixed(2));
export function inrShort(n) {
  n = Math.round(n);
  if (n >= 1e7) return '₹' + trim(n / 1e7) + ' Cr';
  if (n >= 1e5) return '₹' + trim(n / 1e5) + ' L';
  return inr(n);
}
export const roundTo = (n, step = 1000) => Math.round(n / step) * step;
