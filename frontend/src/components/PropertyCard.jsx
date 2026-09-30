import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useCompare } from "../lib/CompareContext";
import { useSaved } from "../lib/SaveContext";
import { useRequireAuth } from "../lib/useRequireAuth";
import PropertyImage from "./PropertyImage";
import { formatINR, formatArea, getDisplayName } from "../lib/format";

const LEGAL_TRUST = {
  "Clear Title": { label: "Clear title", tone: "text-good" },
  "Registry Ready": { label: "Registry ready", tone: "text-good" },
  "Bank Loan Eligible": { label: "Loan eligible", tone: "text-good" },
  "Documentation Pending": { label: "Docs pending", tone: "text-amber-400" },
  "Title Verification Pending": { label: "Verification pending", tone: "text-amber-400" },
  "Dispute Check Required": { label: "Dispute check needed", tone: "text-risk" },
};

export default function PropertyCard({ property, index = 0 }) {
  const navigate = useNavigate();
  const { ids, toggle, maxCompare } = useCompare();
  const { ids: savedIds, toggle: toggleSave } = useSaved();
  const requireAuth = useRequireAuth();
  const isSelected = ids.includes(property.property_id);
  const isSaved = savedIds.includes(property.property_id);
  const trust = LEGAL_TRUST[property.legal_status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="border border-hairline rounded-xl overflow-hidden bg-surface hover:border-marigold/60 transition-colors"
    >
      <div className="relative h-36">
        <PropertyImage category={property.land_type || property.property_type} seed={property.property_id} className="h-36" />
        <div className="absolute top-2 left-3 right-3 flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wide text-white bg-black/40 px-2 py-0.5 rounded">
            {property.land_type || property.property_type}
          </span>
          <button
            onClick={() => requireAuth(() => toggleSave(property.property_id))}
            className={`text-lg ${isSaved ? "text-red-400" : "text-white/80"} hover:text-red-400 transition-colors`}
            aria-label={isSaved ? "Remove from saved" : "Save property"}
          >
            {isSaved ? "♥" : "♡"}
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-serif text-base">{getDisplayName(property)}</p>
            <p className="text-xs text-muted">{property.locality || "Locality unlisted"}</p>
          </div>
          {trust && <span className={`text-[11px] font-mono shrink-0 ${trust.tone}`}>{trust.label}</span>}
        </div>

        <div className="flex gap-4 mt-3 font-mono text-sm flex-wrap">
          <span className="text-marigold font-semibold">{formatINR(property.asking_price_inr)}</span>
          <span>{formatArea(property.area_sqft)}</span>
        </div>
        {property.price_per_sqft_inr && (
          <p className="text-xs text-muted font-mono mt-1">₹{Math.round(property.price_per_sqft_inr)}/sqft</p>
        )}

        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={() => navigate(`/properties/${property.property_id}`)}
            className="flex-1 text-sm bg-marigold text-white rounded-md py-2 hover:bg-marigoldDim transition-colors"
          >
            View Details
          </button>
          <label className="flex items-center gap-1.5 text-xs text-muted cursor-pointer whitespace-nowrap">
            <input
              type="checkbox"
              checked={isSelected}
              disabled={!isSelected && ids.length >= maxCompare}
              onChange={() => toggle(property.property_id)}
            />
            Compare
          </label>
        </div>
      </div>
    </motion.div>
  );
}