// Human-friendly budget breakpoints, spanning your real price range (₹4L–₹23Cr)
export const BUDGET_STEPS = [
  400000, 1000000, 1500000, 2000000, 2500000, 3000000, 4000000, 5000000,
  7500000, 10000000, 15000000, 20000000, 25000000, 30000000, 40000000,
  50000000, 75000000, 100000000, 150000000, 200000000, 230850000,
];

export function formatCompact(value) {
  if (value >= 10000000) {
    const cr = value / 10000000;
    return `₹${cr % 1 === 0 ? cr : cr.toFixed(1)} Cr`;
  }
  if (value >= 100000) {
    const l = value / 100000;
    return `₹${l % 1 === 0 ? l : l.toFixed(1)} L`;
  }
  return `₹${value.toLocaleString("en-IN")}`;
}

export function indexToValue(index) {
  return BUDGET_STEPS[Math.min(Math.max(index, 0), BUDGET_STEPS.length - 1)];
}

export function valueToIndex(value) {
  let closest = 0;
  let closestDiff = Infinity;
  BUDGET_STEPS.forEach((step, i) => {
    const diff = Math.abs(step - value);
    if (diff < closestDiff) { closest = i; closestDiff = diff; }
  });
  return closest;
}