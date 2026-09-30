import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";
import { Building2, CheckCircle2, Tag, XCircle, Users } from "lucide-react";
import { api } from "../lib/api";
import { LoadingState, ErrorState } from "../components/StatusStates";
import { formatINR, formatArea } from "../lib/format";
import AdminLocalityMap from "../components/AdminLocalityMap";

const STATUS_COLORS = { active: "text-good", sold: "text-marigold", withdrawn: "text-muted" };
const CHART_AXIS = "#8B93B0";
const CHART_GRID = "#2A3555";
const TOOLTIP_STYLE = { background: "#1C2540", border: "1px solid #2A3555", borderRadius: 6 };
const STATUS_PIE_COLORS = { Active: "#34D399", Sold: "#6366F1", Withdrawn: "#8B93B0" };
const RESALE_PIE_COLORS = { New: "#6366F1", Resale: "#F59E0B" };

function StatCard({ icon: Icon, label, value, tone }) {
  const tones = {
    indigo: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
    emerald: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    amber: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    rose: "bg-rose-500/10 text-rose-300 border-rose-500/30",
    slate: "bg-slate-500/10 text-slate-300 border-slate-500/30",
  };
  return (
    <div className={`border rounded-xl p-4 flex items-center gap-3 ${tones[tone]}`}>
      <Icon size={22} />
      <div>
        <p className="text-xl font-serif">{value}</p>
        <p className="text-[11px] uppercase tracking-wide opacity-80">{label}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [summary, setSummary] = useState(null);
  const [types, setTypes] = useState(null);
  const [localities, setLocalities] = useState(null);
  const [trend, setTrend] = useState(null);
  const [resaleSplit, setResaleSplit] = useState(null);

  useEffect(() => {
    api.adminDashboardSummary().then(setSummary).catch(() => setSummary(null));
    api.propertyTypeAnalytics().then(setTypes).catch(() => setTypes(null));
    api.localityAnalytics().then((res) => setLocalities([...res].sort((a, b) => b.total_properties - a.total_properties).slice(0, 10))).catch(() => setLocalities(null));
    api.listingTrend().then(setTrend).catch(() => setTrend(null));
    api.newResaleSplit().then(setResaleSplit).catch(() => setResaleSplit(null));
  }, []);

  useEffect(() => { load(); }, [statusFilter]);

  function load() {
    setStatus("loading");
    api.adminListProperties(statusFilter ? { status: statusFilter } : { page_size: 20 })
      .then((res) => { setData(res); setStatus("done"); })
      .catch((err) => { setError(err.message); setStatus("error"); });
  }

  async function handleStatusChange(id, newStatus) {
    try { await api.adminSetStatus(id, newStatus); load(); } catch (err) { alert(err.message); }
  }

  async function handleDelete(id) {
    if (!confirm(`Permanently delete ${id}? This cannot be undone.`)) return;
    try { await api.adminDeleteProperty(id); load(); } catch (err) { alert(err.message); }
  }

  const statusMix = summary ? [
    { name: "Active", value: summary.active_properties },
    { name: "Sold", value: summary.sold_properties },
    { name: "Withdrawn", value: summary.withdrawn_properties },
  ].filter((s) => s.value > 0) : [];

  const resaleMix = resaleSplit
    ? resaleSplit.map((r) => ({ name: r.label, value: r.count })).filter((r) => r.value > 0)
    : [];

  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      <h1 className="font-serif text-2xl mb-6">Dashboard</h1>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          <StatCard icon={Building2} label="Total properties" value={summary.total_properties} tone="indigo" />
          <StatCard icon={CheckCircle2} label="Active" value={summary.active_properties} tone="emerald" />
          <StatCard icon={Tag} label="Sold" value={summary.sold_properties} tone="amber" />
          <StatCard icon={XCircle} label="Withdrawn" value={summary.withdrawn_properties} tone="slate" />
          <StatCard icon={Users} label="Registered Users" value={summary.total_users} tone="rose" />
        </div>
      )}

      <div className="border border-hairline rounded-xl p-4 bg-surface mb-6">
        <p className="text-sm mb-3">Nagpur localities — top 15 by listing count</p>
        <AdminLocalityMap />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {statusMix.length > 0 && (
          <div className="border border-hairline rounded-xl p-4 bg-surface">
            <p className="text-sm mb-3">Property status breakdown</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusMix} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                  {statusMix.map((s) => <Cell key={s.name} fill={STATUS_PIE_COLORS[s.name]} />)}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "#EDEFF7" }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {resaleMix.length > 0 && (
          <div className="border border-hairline rounded-xl p-4 bg-surface">
            <p className="text-sm mb-3">New vs. Resale listings</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={resaleMix} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                  {resaleMix.map((s) => <Cell key={s.name} fill={RESALE_PIE_COLORS[s.name] || "#8B93B0"} />)}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "#EDEFF7" }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {trend && trend.length > 1 && (
        <div className="border border-hairline rounded-xl p-4 bg-surface mb-6">
          <p className="text-sm mb-3">Listings added over time</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trend}>
              <CartesianGrid stroke={CHART_GRID} vertical={false} />
              <XAxis dataKey="month" stroke={CHART_AXIS} fontSize={10} />
              <YAxis stroke={CHART_AXIS} fontSize={11} />
              <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "#EDEFF7" }} />
              <Line type="monotone" dataKey="count" stroke="#6366F1" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {types && (
          <div className="border border-hairline rounded-xl p-4 bg-surface">
            <p className="text-sm mb-3">Listings by property type</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={types}>
                <CartesianGrid stroke={CHART_GRID} vertical={false} />
                <XAxis dataKey="property_type" stroke={CHART_AXIS} fontSize={11} />
                <YAxis stroke={CHART_AXIS} fontSize={11} />
                <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "#EDEFF7" }} />
                <Bar dataKey="total_properties" fill="#6366F1" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {types && (
          <div className="border border-hairline rounded-xl p-4 bg-surface">
            <p className="text-sm mb-3">Average price by property type</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={types}>
                <CartesianGrid stroke={CHART_GRID} vertical={false} />
                <XAxis dataKey="property_type" stroke={CHART_AXIS} fontSize={11} />
                <YAxis stroke={CHART_AXIS} fontSize={11} tickFormatter={(v) => formatINR(v)} />
                <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "#EDEFF7" }} formatter={(v) => formatINR(v)} />
                <Bar dataKey="avg_price" fill="#34D399" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {localities && (
        <div className="border border-hairline rounded-xl p-4 bg-surface mb-10">
          <p className="text-sm mb-3">Top 10 localities by listing count</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={localities}>
              <CartesianGrid stroke={CHART_GRID} vertical={false} />
              <XAxis dataKey="locality" stroke={CHART_AXIS} fontSize={9} angle={-30} textAnchor="end" height={60} />
              <YAxis stroke={CHART_AXIS} fontSize={11} />
              <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "#EDEFF7" }} />
              <Bar dataKey="total_properties" fill="#FBBF24" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-xl">Property records</h2>
        <div className="flex items-center gap-3">
          <a href="/admin/add" className="text-sm text-marigold hover:underline">+ Add property</a>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-surface border border-hairline rounded px-3 py-1.5 text-sm">
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="sold">Sold</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
        </div>
      </div>

      {status === "loading" && <LoadingState label="Loading records…" />}
      {status === "error" && <ErrorState message={error} onRetry={load} />}

      {status === "done" && data && (
        <div className="space-y-2">
          <p className="text-xs text-muted font-mono mb-3">Showing {data.results.length} of {data.total} records</p>
          {data.results.map((p) => (
            <div key={p.property_id} className="border border-hairline rounded-md p-4 flex items-center justify-between gap-4 flex-wrap bg-surface">
              <div>
                <p className="font-mono text-xs text-muted">{p.property_id}</p>
                <p className="text-sm">{p.locality} · {p.land_type} · {formatArea(p.area_sqft)}</p>
                <p className="font-mono text-sm">{formatINR(p.asking_price_inr)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-mono uppercase ${STATUS_COLORS[p.status]}`}>{p.status}</span>
                <select value={p.status} onChange={(e) => handleStatusChange(p.property_id, e.target.value)}
                  className="bg-surfaceRaised border border-hairline rounded px-2 py-1 text-xs">
                  <option value="active">Active</option>
                  <option value="sold">Sold</option>
                  <option value="withdrawn">Withdrawn</option>
                </select>
                <button onClick={() => handleDelete(p.property_id)} className="text-xs text-risk hover:underline">Delete</button>
              </div>
            </div>
          ))}
          <a href="/admin/properties"
            className="block text-center border border-hairline rounded-md py-3 text-sm text-marigold hover:border-marigold mt-4">
            View all {data.total} properties →
          </a>
        </div>
      )}
    </div>
  );
}