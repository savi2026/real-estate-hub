import { useEffect, useState } from "react";
import { api } from "../lib/api";
import BudgetRangeSlider from "../components/BudgetRangeSlider";
import { LAND_TYPES_BY_PROPERTY_TYPE } from "../lib/landTypes";
import { LoadingState, ErrorState } from "../components/StatusStates";
import { formatINR, formatArea } from "../lib/format";

const PROPERTY_TYPES = ["", "Residential", "Commercial", "Agriculture"];

const EMPTY_FILTERS = {
  status: "", property_type: "", land_type: "", locality: "", min_area: "", max_area: "", min_price: "", max_price: "",
};

export default function AdminAllProperties() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const pageSize = 25;

  useEffect(() => { load(); }, [filters, page]);

  function update(field, value) {
    setFilters((f) => ({ ...f, [field]: value }));
    setPage(1);
  }

  function updatePropertyType(value) {
    setFilters((f) => ({ ...f, property_type: value, land_type: "" }));
    setPage(1);
  }

  function buildParams() {
    const params = { page, page_size: pageSize };
    for (const [key, val] of Object.entries(filters)) {
      if (val !== "") params[key] = val;
    }
    return params;
  }

  function load() {
    setStatus("loading");
    api.adminListProperties(buildParams())
      .then((res) => { setData(res); setStatus("done"); })
      .catch((err) => { setError(err.message); setStatus("error"); });
  }

  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;
  const inputClass = "bg-surfaceRaised border border-hairline rounded-md px-3 py-2 text-sm text-paper focus:outline-none focus:border-marigold";
  const labelClass = "text-xs text-muted mb-1 block";

  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      <h1 className="font-serif text-2xl mb-6">All Properties</h1>

      <div className="border border-hairline rounded-xl p-4 bg-surface mb-6 space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className={labelClass}>Status</label>
            <select className={inputClass} value={filters.status} onChange={(e) => update("status", e.target.value)}>
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="sold">Sold</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Property type</label>
            <select className={inputClass} value={filters.property_type} onChange={(e) => updatePropertyType(e.target.value)}>
              {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t || "All"}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Land type</label>
            <select className={inputClass} value={filters.land_type} onChange={(e) => update("land_type", e.target.value)}>
              <option value="">All</option>
              {(filters.property_type ? LAND_TYPES_BY_PROPERTY_TYPE[filters.property_type] : Object.values(LAND_TYPES_BY_PROPERTY_TYPE).flat()).map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Locality</label>
            <input className={inputClass} placeholder="e.g. Besa" value={filters.locality} onChange={(e) => update("locality", e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Area (sq.ft)</label>
            <div className="flex gap-2">
              <input type="number" className={inputClass} placeholder="Min" value={filters.min_area} onChange={(e) => update("min_area", e.target.value)} />
              <input type="number" className={inputClass} placeholder="Max" value={filters.max_area} onChange={(e) => update("max_area", e.target.value)} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Budget</label>
            <BudgetRangeSlider
              minValue={filters.min_price ? Number(filters.min_price) : 400000}
              maxValue={filters.max_price ? Number(filters.max_price) : 230850000}
              onChange={({ min, max }) => setFilters((f) => ({ ...f, min_price: min, max_price: max }))}
            />
          </div>
        </div>

        {JSON.stringify(filters) !== JSON.stringify(EMPTY_FILTERS) && (
          <button onClick={() => setFilters(EMPTY_FILTERS)} className="text-xs text-marigold hover:underline">Clear all filters</button>
        )}
      </div>

      {status === "loading" && <LoadingState label="Loading properties…" />}
      {status === "error" && <ErrorState message={error} onRetry={load} />}

      {status === "done" && data && (
        <>
          <p className="text-xs text-muted font-mono mb-3">{data.total} properties match these filters</p>
          <div className="overflow-x-auto border border-hairline rounded-xl bg-surface">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-hairline text-muted text-xs uppercase tracking-wide">
                  <th className="text-left px-4 py-3">Property ID</th>
                  <th className="text-left px-4 py-3">Locality</th>
                  <th className="text-left px-4 py-3">Type</th>
                  <th className="text-left px-4 py-3">Land Type</th>
                  <th className="text-left px-4 py-3">Area</th>
                  <th className="text-left px-4 py-3">Price</th>
                  <th className="text-left px-4 py-3">₹/sq.ft</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Updated</th>
                </tr>
              </thead>
              <tbody>
                {data.results.map((p) => (
                  <tr key={p.property_id} className="border-b border-hairline">
                    <td className="px-4 py-3 font-mono text-xs text-marigold">{p.property_id}</td>
                    <td className="px-4 py-3">{p.locality}</td>
                    <td className="px-4 py-3">{p.property_type}</td>
                    <td className="px-4 py-3">{p.land_type}</td>
                    <td className="px-4 py-3 font-mono">{formatArea(p.area_sqft)}</td>
                    <td className="px-4 py-3 font-mono">{formatINR(p.asking_price_inr)}</td>
                    <td className="px-4 py-3 font-mono">{p.price_per_sqft_inr ? `₹${Math.round(p.price_per_sqft_inr)}` : "—"}</td>
                    <td className="px-4 py-3 uppercase text-xs font-mono">{p.status}</td>
                    <td className="px-4 py-3 text-xs text-muted">{p.updated_at ? new Date(p.updated_at).toLocaleDateString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="text-sm disabled:opacity-30">← Prev</button>
              <span className="text-xs text-muted font-mono">Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="text-sm disabled:opacity-30">Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}