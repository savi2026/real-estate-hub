import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ScoreMeter from "./ScoreMeter";
import PriorityBadge from "./PriorityBadge";
import PropertyImage from "./PropertyImage";
import { useSaved } from "../lib/SaveContext";
import { useRequireAuth } from "../lib/useRequireAuth";
import { formatINR, formatArea, getDisplayName } from "../lib/format";

export default function PropertyRow({ property, index = 0, requestPayload = null }) {
  const navigate = useNavigate();
  const { ids: savedIds, toggle: toggleSave } = useSaved();
  const requireAuth = useRequireAuth();
  const isSaved = savedIds.includes(property.property_id);
  const hasFeasibility = property.estimated_profit_inr !== null && property.estimated_profit_inr !== undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      whileHover={{ y: -2 }}
      className="border border-hairline rounded-xl overflow-hidden bg-surface hover:border-marigoldDim transition-colors flex flex-col sm:flex-row"
    >
      <div className="relative w-full sm:w-40 h-40 sm:h-auto shrink-0">
        <PropertyImage category={property.land_type || property.property_type} seed={property.property_id} className="h-full" />
        <button
          onClick={() => requireAuth(() => toggleSave(property.property_id))}
          className={`absolute top-2 right-2 text-lg ${isSaved ? "text-red-400" : "text-white/80"} hover:text-red-400 transition-colors`}
          aria-label={isSaved ? "Remove from saved" : "Save property"}
        >
          {isSaved ? "♥" : "♡"}
        </button>
      </div>

      <div className="flex-1 min-w-0 p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="font-serif text-lg">{getDisplayName(property)}</p>
            <p className="text-sm text-muted">
              {property.locality} · {property.property_type}
              {property.facing && property.property_type !== "Agriculture" ? ` · ${property.facing} facing` : ""}
              {property.new_resale ? ` · ${property.new_resale}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <ScoreMeter score={property.match_score} />
            {hasFeasibility && <PriorityBadge priority={property.priority} />}
            <button
              onClick={() => navigate(`/properties/${property.property_id}`, { state: { matchedProperty: property, requestPayload } })}
              className="text-sm text-marigold hover:underline shrink-0 ml-1"
            >
              View details →
            </button>
          </div>
        </div>

        <div className="flex gap-6 mt-3 font-mono text-sm flex-wrap">
          <span>{formatArea(property.area_sqft)}</span>
          <span>{formatINR(property.asking_price_inr)}</span>
          {property.price_per_sqft_inr && (
            <span className="text-muted">₹{Math.round(property.price_per_sqft_inr)}/sqft</span>
          )}
        </div>

        {hasFeasibility && (
          <div className="mt-4 grid grid-cols-3 gap-4 bg-surfaceRaised rounded-md p-3 border border-hairline">
            <div>
              <p className="text-[11px] text-muted uppercase tracking-wide">Est. revenue</p>
              <p className="font-mono text-sm text-paper">{formatINR(property.estimated_revenue_inr)}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted uppercase tracking-wide">Est. profit</p>
              <p className={`font-mono text-sm ${property.estimated_profit_inr >= 0 ? "text-good" : "text-risk"}`}>
                {formatINR(property.estimated_profit_inr)}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-muted uppercase tracking-wide">Margin / ROI</p>
              <p className="font-mono text-sm text-paper">
                {property.profit_margin_percent?.toFixed(1)}% · {property.roi_on_land_percent?.toFixed(1)}%
              </p>
            </div>
          </div>
        )}

        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          {property.match_reasons.map((reason, i) => (
            <li key={i} className="text-xs text-muted flex items-center gap-1">
              <span className="text-good">✓</span> {reason}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}