import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { api } from "../lib/api";
import { LoadingState, ErrorState } from "../components/StatusStates";
import { formatINR } from "../lib/format";
import AdminLocalityMap from "../components/AdminLocalityMap";

const CHART_AXIS = "#8B93B0";
const CHART_GRID = "#2A3555";
const TOOLTIP_STYLE = { background: "#1C2540", border: "1px solid #2A3555", borderRadius: 6 };
const PIE_COLORS = ["#6366F1", "#34D399", "#F59E0B"];

export default function Analytics() {
  const navigate = useNavigate();
  const [localities, setLocalities] = useState(null);
  const [types, setTypes] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  useEffect(() => { load(); }, []);

  function load() {
    setStatus("loading");
    Promise.all([api.localityAnalytics(), api.propertyTypeAnalytics()])
      .then(([loc, typ]) => { setLocalities(loc); setTypes(typ); setStatus("done"); })
      .catch((err) => { setError(err.message); setStatus("error"); });
  }

  const topLocalities = localities
    ? [...localities].sort((a, b) => a.opportunity_score - b.opportunity_score).slice(0, 10)
    : [];

  const totalProperties = types ? types.reduce((s, t) => s + t.total_properties, 0) : 0;
  const avgPriceOverall = types
    ? types.reduce((s, t) => s + t.avg_price * t.total_properties, 0) / (totalProperties || 1)
    : 0;

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="font-serif text-3xl mb-1">Market insights</h1>
      <p className="text-muted mb-10 text-sm">
        Computed directly from your live property database — real averages, not estimates.
      </p>

      {status === "loading" && <LoadingState label="Loading market data…" />}
      {status === "error" && <ErrorState message={error} onRetry={load} />}

      {status === "done" && (
        <div className="space-y-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border border-hairline rounded-xl p-4 bg-surface text-center">
              <p className="font-serif text-2xl text-marigold">{totalProperties.toLocaleString("en-IN")}</p>
              <p className="text-[11px] text-muted uppercase tracking-wide mt-1">Properties</p>
            </div>
            <div className="border border-hairline rounded-xl p-4 bg-surface text-center">
              <p className="font-serif text-2xl text-marigold">{localities.length}</p>
              <p className="text-[11px] text-muted uppercase tracking-wide mt-1">Localities</p>
            </div>
            <div className="border border-hairline rounded-xl p-4 bg-surface text-center">
              <p className="font-serif text-2xl text-marigold">{formatINR(avgPriceOverall)}</p>
              <p className="text-[11px] text-muted uppercase tracking-wide mt-1">Avg. Price</p>
            </div>
            <div className="border border-hairline rounded-xl p-4 bg-surface text-center">
              <p className="font-serif text-2xl text-marigold">{types.length}</p>
              <p className="text-[11px] text-muted uppercase tracking-wide mt-1">Property Types</p>
            </div>
          </div>

          <div className="border border-hairline rounded-xl p-4 bg-surface">
            <p className="text-sm mb-3">Nagpur localities map</p>
            <AdminLocalityMap />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-hairline rounded-md p-5 bg-surface">
              <p className="text-sm text-paper mb-1">Listings by property type</p>
              <p className="text-xs text-muted mb-4">Share of all 1,500 listings</p>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={types} dataKey="total_properties" nameKey="property_type" cx="50%" cy="50%" outerRadius={75}>
                    {types.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "#EDEFF7" }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="border border-hairline rounded-md p-5 bg-surface">
              <p className="text-sm text-paper mb-1">Average price per sq.ft by property type</p>
              <p className="text-xs text-muted mb-4">Across all 1,500 listings</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={types}>
                  <CartesianGrid stroke={CHART_GRID} vertical={false} />
                  <XAxis dataKey="property_type" stroke={CHART_AXIS} fontSize={12} />
                  <YAxis stroke={CHART_AXIS} fontSize={11} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "#EDEFF7" }} formatter={(v) => [`₹${Math.round(v)}/sqft`, "Avg"]} />
                  <Bar dataKey="avg_price_per_sqft" fill="#6366F1" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="border border-hairline rounded-md p-5 bg-surface md:col-span-2">
              <p className="text-sm text-paper mb-1">Average area by property type</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={types}>
                  <CartesianGrid stroke={CHART_GRID} vertical={false} />
                  <XAxis dataKey="property_type" stroke={CHART_AXIS} fontSize={12} />
                  <YAxis stroke={CHART_AXIS} fontSize={11} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "#EDEFF7" }} formatter={(v) => [`${Math.round(v)} sq.ft`, "Avg area"]} />
                  <Bar dataKey="avg_area_sqft" fill="#34D399" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="border border-hairline rounded-md p-5 bg-surface">
            <p className="text-sm text-paper mb-1">Top 10 localities by opportunity</p>
            <p className="text-xs text-muted mb-4">
              Lower score = more favorable. Click a locality to browse its listings.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {topLocalities.map((l) => (
                <button
                  key={l.locality}
                  onClick={() => navigate(`/browse?locality=${encodeURIComponent(l.locality)}`)}
                  className="text-left rounded-xl border border-hairline bg-surfaceRaised p-4 hover:border-marigold transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-serif text-base">{l.locality}</p>
                    <span className="text-xs font-mono text-marigold">rank {l.opportunity_score}</span>
                  </div>
                  <p className="text-xs text-muted font-mono">{formatINR(l.avg_price)} avg · {l.total_properties} listings</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}