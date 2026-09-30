import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { api } from "../lib/api";
import { useCompare } from "../lib/CompareContext";
import { LoadingState, ErrorState, EmptyState } from "../components/StatusStates";
import { formatINR, formatArea, getDisplayName } from "../lib/format";

const ROWS = [
  { label: "Locality", key: "locality" },
  { label: "Property type", key: "property_type" },
  { label: "Land type", key: "land_type" },
  { label: "Area", key: "area_sqft", format: formatArea, better: "max" },
  { label: "Asking price", key: "asking_price_inr", format: formatINR, better: "min" },
  { label: "Price / sq.ft", key: "price_per_sqft_inr", format: (v) => v ? `₹${Math.round(v)}` : "—", better: "min" },
  { label: "FSI", key: "fsi", better: "max" },
  { label: "Facing", key: "facing" },
  { label: "New / Resale", key: "new_resale" },
  { label: "Legal status", key: "legal_status" },
  { label: "Ownership", key: "ownership_type" },
];

const PIE_COLORS = ["#6366F1", "#34D399", "#F87171", "#FBBF24"];
const CHART_AXIS = "#8B93B0";
const CHART_GRID = "#2A3555";
const TOOLTIP_STYLE = { background: "#1C2540", border: "1px solid #2A3555", borderRadius: 6 };

function bestIndex(properties, key, better) {
  if (!better) return -1;
  const values = properties.map((p) => p[key]);
  if (values.some((v) => v === null || v === undefined)) return -1;
  const target = better === "min" ? Math.min(...values) : Math.max(...values);
  return values.indexOf(target);
}

export default function Compare() {
  const { ids, clear } = useCompare();
  const [properties, setProperties] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (ids.length === 0) { setStatus("done"); setProperties([]); return; }
    setStatus("loading");
    Promise.all(ids.map((id) => api.getProperty(id)))
      .then((res) => { setProperties(res); setStatus("done"); })
      .catch((err) => { setError(err.message); setStatus("error"); });
  }, [ids]);

  const priceData = properties?.map((p) => ({ name: getDisplayName(p), value: p.asking_price_inr })) || [];
  const areaData = properties?.map((p) => ({ name: getDisplayName(p), value: p.area_sqft })) || [];
  const ppsfData = properties?.map((p) => ({ name: getDisplayName(p), value: p.price_per_sqft_inr || 0 })) || [];

  const typeCounts = {};
  properties?.forEach((p) => { typeCounts[p.property_type] = (typeCounts[p.property_type] || 0) + 1; });
  const typeMix = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));

  // Grid columns must match the actual number of properties selected (2 or 3),
  // never a hardcoded count — that hardcoding was the bug causing the empty column.
  const gridStyle = properties?.length
    ? { gridTemplateColumns: `180px repeat(${properties.length}, 1fr)` }
    : undefined;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl">Compare properties</h1>
        {properties?.length > 0 && (
          <button onClick={clear} className="text-xs text-muted hover:text-paper">Clear selection</button>
        )}
      </div>

      {status === "loading" && <LoadingState label="Loading properties…" />}
      {status === "error" && <ErrorState message={error} />}
      {status === "done" && properties?.length === 0 && (
        <EmptyState title="Nothing to compare yet" message="Add up to 3 properties from Browse, Results, or a property page to compare them here." />
      )}

      {status === "done" && properties?.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="border border-hairline rounded-xl p-4 bg-surface">
              <p className="text-sm mb-3">Asking price</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={priceData}>
                  <CartesianGrid stroke={CHART_GRID} vertical={false} />
                  <XAxis dataKey="name" stroke={CHART_AXIS} fontSize={9} />
                  <YAxis stroke={CHART_AXIS} fontSize={10} tickFormatter={(v) => formatINR(v)} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "#EDEFF7" }} formatter={(v) => formatINR(v)} />
                  <Bar dataKey="value" fill="#6366F1" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="border border-hairline rounded-xl p-4 bg-surface">
              <p className="text-sm mb-3">Area (sq.ft)</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={areaData}>
                  <CartesianGrid stroke={CHART_GRID} vertical={false} />
                  <XAxis dataKey="name" stroke={CHART_AXIS} fontSize={9} />
                  <YAxis stroke={CHART_AXIS} fontSize={10} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "#EDEFF7" }} />
                  <Bar dataKey="value" fill="#34D399" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="border border-hairline rounded-xl p-4 bg-surface">
              <p className="text-sm mb-3">Price per sq.ft</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={ppsfData}>
                  <CartesianGrid stroke={CHART_GRID} vertical={false} />
                  <XAxis dataKey="name" stroke={CHART_AXIS} fontSize={9} />
                  <YAxis stroke={CHART_AXIS} fontSize={10} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "#EDEFF7" }} formatter={(v) => `₹${Math.round(v)}`} />
                  <Bar dataKey="value" fill="#FBBF24" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {typeMix.length > 1 && (
            <div className="border border-hairline rounded-xl p-4 bg-surface mb-10 max-w-sm">
              <p className="text-sm mb-3">Property type mix</p>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={typeMix} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65}>
                    {typeMix.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "#EDEFF7" }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          {typeMix.length <= 1 && <div className="mb-6" />}

          <div className="border border-hairline rounded-xl overflow-hidden bg-surface">
            {ROWS.map((row, ri) => {
              const best = bestIndex(properties, row.key, row.better);
              return (
                <div key={row.key} className={`grid ${ri % 2 === 0 ? "bg-surfaceRaised/40" : ""}`} style={gridStyle}>
                  <div className="text-muted text-sm px-4 py-3 border-b border-hairline">{row.label}</div>
                  {properties.map((p, i) => (
                    <div
                      key={p.property_id}
                      className={`font-mono text-sm px-4 py-3 border-b border-hairline border-l ${
                        i === best ? "text-good font-semibold bg-good/5" : ""
                      }`}
                    >
                      {row.format ? row.format(p[row.key]) : (p[row.key] ?? "—")}
                      {i === best && <span className="ml-1.5 text-[10px]">★ best</span>}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}