export function deliveryDashTitle({
  efficiency,
  bestCombo,
  express,
  elapsed,
}: {
  efficiency: number;
  bestCombo: number;
  express: boolean;
  elapsed: number;
}) {
  if (express) return 'Express Hero';
  if (efficiency >= 88) return 'Route Genius';
  if (elapsed <= 48) return 'Speed Courier';
  if (bestCombo >= 4) return 'Smooth Operator';
  return 'Scenic Driver';
}
