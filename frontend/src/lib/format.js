export function getDisplayName(property) {
  const place = property.sub_locality || property.locality || "Property";
  const type = property.land_type || property.property_type || "";
  return type ? `${place} ${type}` : place;
}

export function formatINR(value) {
  if (value === null || value === undefined) return "—";
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

export function formatCompact(value) {
  if (value === null || value === undefined) return "—";
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)} L`;
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

export function formatArea(value) {
  if (value === null || value === undefined) return "—";
  return `${Number(value).toLocaleString("en-IN")} sq.ft`;
}

export function formatNumber(value) {
  if (value === null || value === undefined) return "—";
  return Number(value).toLocaleString("en-IN");
}