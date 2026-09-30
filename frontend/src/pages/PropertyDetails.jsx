import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Repeat, Compass, Milestone, KeySquare, ShieldCheck, BadgeCheck, MapPin, CalendarDays, Sparkles,
} from "lucide-react";
import { api } from "../lib/api";
import { useCompare } from "../lib/CompareContext";
import { useSaved } from "../lib/SaveContext";
import { useRequireAuth } from "../lib/useRequireAuth";
import { LoadingState, ErrorState } from "../components/StatusStates";
import { formatINR, formatArea, getDisplayName } from "../lib/format";
import PropertyMap from "../components/PropertyMap";
import PropertyImage from "../components/PropertyImage";

function Field({ label, value }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="py-3 border-b border-hairline flex justify-between gap-4">
      <span className="text-muted text-sm">{label}</span>
      <span className="text-right font-mono text-sm">{value}</span>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="border border-hairline rounded-lg p-4 bg-surface text-center">
      <p className="font-mono text-lg text-marigold">{value}</p>
      <p className="text-[11px] text-muted uppercase tracking-wide mt-1">{label}</p>
    </div>
  );
}

const LEGAL_TONE = {
  "Clear Title": "good", "Registry Ready": "good", "Bank Loan Eligible": "good",
  "Documentation Pending": "amber", "Title Verification Pending": "amber", "Dispute Check Required": "risk",
};

const TONE_CLASSES = {
  indigo: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
  sky: "bg-sky-500/10 text-sky-300 border-sky-500/30",
  emerald: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  amber: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  purple: "bg-purple-500/10 text-purple-300 border-purple-500/30",
  rose: "bg-rose-500/10 text-rose-300 border-rose-500/30",
  good: "bg-good/10 text-good border-good/30",
  risk: "bg-risk/10 text-risk border-risk/30",
  slate: "bg-slate-500/10 text-slate-300 border-slate-500/30",
};

function InfoChip({ icon: Icon, label, value, tone = "slate" }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className={`rounded-xl border p-4 flex items-start gap-3 ${TONE_CLASSES[tone]}`}>
      <Icon size={20} className="mt-0.5 shrink-0" />
      <div>
        <p className="text-[11px] uppercase tracking-wide opacity-80">{label}</p>
        <p className="text-sm font-medium mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { ids, toggle } = useCompare();
  const { ids: savedIds, toggle: toggleSave } = useSaved();
  const requireAuth = useRequireAuth();
  const [status, setStatus] = useState("loading");
  const [property, setProperty] = useState(null);
  const [error, setError] = useState(null);

  const matchedProperty = location.state?.matchedProperty;
  const requestPayload = location.state?.requestPayload;
  const hasFeasibility = matchedProperty?.estimated_profit_inr !== null && matchedProperty?.estimated_profit_inr !== undefined;
  const isComparing = property && ids.includes(property.property_id);
  const isSaved = property && savedIds.includes(property.property_id);

  useEffect(() => { load(); }, [id]);

  function load() {
    setStatus("loading");
    api.getProperty(id)
      .then((data) => { setProperty(data); setStatus("done"); })
      .catch((err) => { setError(err.message); setStatus(err.status === 404 ? "notfound" : "error"); });
  }

  return (
    <div>
      {status === "loading" && <div className="max-w-6xl mx-auto px-6 py-16"><LoadingState label="Loading property details…" /></div>}
      {status === "error" && <div className="max-w-6xl mx-auto px-6 py-16"><ErrorState message={error} onRetry={load} /></div>}
      {status === "notfound" && (
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="border border-hairline rounded-md p-10 text-center bg-surface">
            <p className="font-serif text-xl mb-2">Property not found</p>
            <p className="text-sm text-muted">This listing may have been removed.</p>
          </div>
        </div>
      )}

      {status === "done" && property && (
        <>
          <div className="relative h-80 border-b border-hairline overflow-hidden">
            <PropertyImage category={property.land_type || property.property_type} seed={property.property_id} className="h-80" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 max-w-6xl mx-auto px-6 pb-6 flex items-end justify-between">
              <div>
                <button onClick={() => navigate(-1)} className="text-sm text-white/80 hover:text-white mb-3">← Back</button>
                <h1 className="font-serif text-4xl text-white mb-1">{getDisplayName(property)}</h1>
                <p className="text-white/70">{property.locality}{property.address ? ` · ${property.address}` : ""}</p>
              </div>
              <button
                onClick={() => requireAuth(() => toggleSave(property.property_id))}
                className={`text-2xl ${isSaved ? "text-red-400" : "text-white/80"} hover:text-red-400 transition-colors`}
                aria-label={isSaved ? "Remove from saved" : "Save property"}
              >
                {isSaved ? "♥" : "♡"}
              </button>
            </div>
          </div>

          <div className="max-w-6xl mx-auto px-6 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              <StatCard label="Price" value={formatINR(property.asking_price_inr)} />
              <StatCard label="Area" value={formatArea(property.area_sqft)} />
              <StatCard label="Type" value={property.land_type || property.property_type} />
              <StatCard label="₹/sq.ft" value={property.price_per_sqft_inr ? `₹${Math.round(property.price_per_sqft_inr)}` : "—"} />
            </div>

            {matchedProperty && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="mb-8 border border-marigold/40 rounded-xl p-5 bg-surface">
                <p className="text-sm text-paper mb-1">Why this property matches</p>
                <p className="font-serif text-2xl text-marigold mb-3">{matchedProperty.match_score}% match</p>
                <ul className="space-y-1">
                  {matchedProperty.match_reasons.map((r, i) => (
                    <li key={i} className="text-sm text-muted flex items-center gap-2">
                      <span className="text-good">✓</span> {r}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {hasFeasibility && requestPayload && (
              <div className="mb-8 border border-hairline rounded-xl p-5 bg-surface">
                <p className="text-sm text-paper mb-4">Development feasibility</p>
                <p className="text-[11px] text-muted uppercase tracking-wide mb-2">From the database</p>
                <Field label="Land price" value={formatINR(property.asking_price_inr)} />
                <Field label="Land area" value={formatArea(property.area_sqft)} />
                <Field label="FSI" value={property.fsi} />
                <p className="text-[11px] text-muted uppercase tracking-wide mt-4 mb-2">Your assumptions for this search</p>
                <Field label="Construction cost / sq.ft" value={`₹${requestPayload.construction_cost_per_sqft}`} />
                <Field label="Target selling price / sq.ft" value={`₹${requestPayload.target_selling_price_per_sqft}`} />
                <Field label="Carpet efficiency" value={`${requestPayload.carpet_efficiency_percent}%`} />
                <Field label="Contingency buffer" value={`${requestPayload.buffer_percent}%`} />
                <p className="text-[11px] text-muted uppercase tracking-wide mt-4 mb-2">Calculated estimates</p>
                <Field label="Built-up area" value={formatArea(matchedProperty.built_up_area_sqft)} />
                <Field label="Estimated revenue" value={formatINR(matchedProperty.estimated_revenue_inr)} />
                <Field label="Estimated cost" value={formatINR(matchedProperty.estimated_cost_inr)} />
                <Field label="Estimated profit" value={formatINR(matchedProperty.estimated_profit_inr)} />
                <Field label="Profit margin" value={`${matchedProperty.profit_margin_percent?.toFixed(1)}%`} />
                <Field label="ROI on land" value={`${matchedProperty.roi_on_land_percent?.toFixed(1)}%`} />
                <p className="text-xs text-muted mt-4">Estimates based on assumptions entered for this search, not guaranteed outcomes.</p>
              </div>
            )}

            <div className="mb-8">
              <p className="text-sm text-paper mb-2">Location</p>
              <PropertyMap locality={property.locality} subLocality={property.sub_locality} />
            </div>

            <p className="text-sm text-paper mb-3">Property details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
              <InfoChip icon={Repeat} label="New / Resale" value={property.new_resale} tone="indigo" />
              {property.property_type !== "Agriculture" && (
                <InfoChip icon={Compass} label="Facing" value={property.facing} tone="sky" />
              )}
              <InfoChip icon={Milestone} label="Main road access" value={property.main_road} tone="emerald" />
              <InfoChip icon={KeySquare} label="Ownership type" value={property.ownership_type} tone="amber" />
              <InfoChip icon={ShieldCheck} label="Legal status" value={property.legal_status} tone={LEGAL_TONE[property.legal_status] || "slate"} />
              <InfoChip icon={BadgeCheck} label="Approval" value={property.nmrda_nit_approval} tone="purple" />
              <InfoChip icon={MapPin} label="Pincode" value={property.pincode} tone="rose" />
              <InfoChip icon={CalendarDays} label="Listing date" value={property.listing_date} tone="slate" />
            </div>

            <div className="flex gap-3">
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                onClick={() => toggle(property.property_id)}
                disabled={!isComparing && ids.length >= 3}
                className={`flex-1 py-3.5 rounded-md font-medium transition-colors ${
                  isComparing ? "bg-risk/20 text-risk border border-risk/40" : "bg-marigold text-white hover:bg-marigoldDim"
                } disabled:opacity-40`}
              >
                {isComparing ? "Remove from Compare List" : "Add to Compare List"}
              </motion.button>
              <button
                onClick={() => requireAuth(() => toggleSave(property.property_id))}
                className={`px-5 rounded-md border font-medium flex items-center gap-2 ${
                  isSaved ? "border-red-400/40 text-red-400" : "border-hairline text-muted hover:text-paper"
                }`}
              >
                <Sparkles size={16} /> {isSaved ? "Saved" : "Save"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}