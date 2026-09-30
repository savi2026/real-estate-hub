import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import { api } from "../lib/api";
import PropertyCard from "../components/PropertyCard";
import BudgetRangeSlider from "../components/BudgetRangeSlider";
import { LAND_TYPES_BY_PROPERTY_TYPE } from "../lib/landTypes";
import { LoadingState, ErrorState, EmptyState } from "../components/StatusStates";

const PROPERTY_TYPES = ["", "Residential", "Commercial", "Agriculture"];
const FIELDS = ["property_type", "land_type", "locality", "min_area", "max_area", "min_price", "max_price"];

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const page = Number(searchParams.get("page") || 1);
  const pageSize = 12;
  const form = Object.fromEntries(FIELDS.map((f) => [f, searchParams.get(f) || ""]));

  useEffect(() => { runSearch(); }, [searchParams]);

  function updateForm(field, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(field, value); else next.delete(field);
    next.set("page", "1");
    setSearchParams(next);
  }

  function updateMultiple(fields) {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(fields)) {
      if (value) next.set(key, value); else next.delete(key);
    }
    next.set("page", "1");
    setSearchParams(next);
  }

  function goToPage(newPage) {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(newPage));
    setSearchParams(next);
  }

  function buildPayload() {
    const payload = { page, page_size: pageSize };
    for (const key of ["property_type", "land_type", "locality"]) {
      if (form[key]) payload[key] = form[key];
    }
    for (const key of ["min_area", "max_area", "min_price", "max_price"]) {
      if (form[key]) payload[key] = Number(form[key]);
    }
    return payload;
  }

  function runSearch() {
    setStatus("loading");
    api.searchProperties(buildPayload())
      .then((res) => { setData(res); setStatus("done"); })
      .catch((err) => { setError(err.message); setStatus("error"); });
  }

  const inputClass = "w-full bg-surfaceRaised border border-hairline rounded-md px-3 py-2 text-sm text-paper focus:outline-none focus:border-marigold";
  const labelClass = "text-xs text-muted mb-1 block";
  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="sticky top-16 z-30 bg-ink pb-4">
        <h1 className="font-serif text-3xl mb-1">Explore properties across Nagpur</h1>
        <p className="text-muted text-sm">Real listings, filtered by what actually matters.</p>
        {data && <p className="text-xs text-muted font-mono mt-2">{data.total} properties found</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <aside className="md:col-span-1 border border-hairline rounded-xl p-4 bg-surface space-y-4 md:sticky md:top-40 md:self-start">
          <p className="text-sm font-medium flex items-center gap-2">Filters</p>

          <div>
            <label className={labelClass}>Property type</label>
            <select className={inputClass} value={form.property_type} onChange={(e) => updateMultiple({ property_type: e.target.value, land_type: "" })}>
              {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t || "All"}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Land type</label>
            <select className={inputClass} value={form.land_type} onChange={(e) => updateForm("land_type", e.target.value)}>
              <option value="">All</option>
              {(form.property_type ? LAND_TYPES_BY_PROPERTY_TYPE[form.property_type] : Object.values(LAND_TYPES_BY_PROPERTY_TYPE).flat()).map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Locality</label>
            <input className={inputClass} placeholder="e.g. Besa" value={form.locality} onChange={(e) => updateForm("locality", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Area (sq.ft)</label>
            <div className="flex gap-2">
              <input type="number" className={inputClass} placeholder="Min" value={form.min_area} onChange={(e) => updateForm("min_area", e.target.value)} />
              <input type="number" className={inputClass} placeholder="Max" value={form.max_area} onChange={(e) => updateForm("max_area", e.target.value)} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Budget</label>
            <BudgetRangeSlider
              minValue={form.min_price ? Number(form.min_price) : 400000}
              maxValue={form.max_price ? Number(form.max_price) : 230850000}
              onChange={({ min, max }) => updateMultiple({ min_price: min, max_price: max })}
            />
          </div>
          {searchParams.toString() && (
            <button onClick={() => setSearchParams({})} className="text-xs text-marigold hover:underline">Clear all filters</button>
          )}
        </aside>

        <div className="md:col-span-3">
          {status === "loading" && <LoadingState label="Searching listings…" />}
          {status === "error" && <ErrorState message={error} onRetry={runSearch} />}
          {status === "done" && data && data.total === 0 && (
            <EmptyState title="No properties match these filters" message="Try widening your search." />
          )}

          {status === "done" && data && data.total > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.results.map((p, i) => <PropertyCard key={p.property_id} property={p} index={i} />)}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                  <button disabled={page <= 1} onClick={() => goToPage(page - 1)} className="text-sm disabled:opacity-30">← Prev</button>
                  <span className="text-xs text-muted font-mono">Page {page} of {totalPages}</span>
                  <button disabled={page >= totalPages} onClick={() => goToPage(page + 1)} className="text-sm disabled:opacity-30">Next →</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}