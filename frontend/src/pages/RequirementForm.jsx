import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import BudgetRangeSlider from "../components/BudgetRangeSlider";
import { LAND_TYPES_BY_PROPERTY_TYPE } from "../lib/landTypes";
import { api } from "../lib/api";
import { useCategoryImage } from "../lib/useCategoryImage";

const PROPERTY_TYPES = ["Residential", "Commercial", "Agriculture"];

export default function RequirementForm() {
  const navigate = useNavigate();
  const bgImage = useCategoryImage("hero");
  const [mode, setMode] = useState("guided");
  const [aiQuery, setAiQuery] = useState("");
  const [aiStatus, setAiStatus] = useState("idle");
  const [aiError, setAiError] = useState(null);

  const [showFeasibility, setShowFeasibility] = useState(false);
  const [form, setForm] = useState({
    property_type: "Residential",
    land_type: "",
    min_area: "",
    max_area: "",
    min_budget: 400000,
    max_budget: 20000000,
    preferred_locality: "",
    strict_locality: true,
    target_selling_price_per_sqft: "",
    construction_cost_per_sqft: "1800",
    carpet_efficiency_percent: "70",
    buffer_percent: "10",
  });
  const [error, setError] = useState(null);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function updatePropertyType(value) {
    setForm((f) => ({ ...f, property_type: value, land_type: "" }));
  }

  async function handleAiParse() {
    setAiStatus("loading");
    setAiError(null);
    try {
      const res = await api.parseRequirement(aiQuery);
      const p = res.parsed_fields;

      const payload = {
        property_type: p.property_type || "Commercial",
        max_budget: p.max_budget !== undefined ? p.max_budget : 1000000000,
        ...(p.min_budget !== undefined && { min_budget: p.min_budget }),
        ...(p.land_type && { land_type: p.land_type }),
        ...(p.min_area !== undefined && { min_area: p.min_area }),
        ...(p.max_area !== undefined && { max_area: p.max_area }),
        ...(p.preferred_locality && { preferred_locality: p.preferred_locality, strict_locality: true }),
        ...(p.target_selling_price_per_sqft !== undefined && {
          target_selling_price_per_sqft: p.target_selling_price_per_sqft,
          construction_cost_per_sqft: 1800,
          carpet_efficiency_percent: 70,
          buffer_percent: 10,
        }),
        max_results: 20,
      };

      navigate("/results", { state: { requestPayload: payload } });
    } catch (err) {
      setAiError(err.message);
      setAiStatus("error");
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (form.min_area && form.max_area && Number(form.min_area) > Number(form.max_area)) {
      setError("Minimum area cannot be greater than maximum area.");
      return;
    }

    const payload = {
      property_type: form.property_type,
      max_budget: form.max_budget,
      min_budget: form.min_budget,
      ...(form.land_type && { land_type: form.land_type }),
      ...(form.min_area && { min_area: Number(form.min_area) }),
      ...(form.max_area && { max_area: Number(form.max_area) }),
      ...(form.preferred_locality && {
        preferred_locality: form.preferred_locality,
        strict_locality: form.strict_locality,
      }),
      max_results: 20,
      ...(showFeasibility && form.target_selling_price_per_sqft && {
        target_selling_price_per_sqft: Number(form.target_selling_price_per_sqft),
        construction_cost_per_sqft: Number(form.construction_cost_per_sqft || 1800),
        carpet_efficiency_percent: Number(form.carpet_efficiency_percent || 70),
        buffer_percent: Number(form.buffer_percent || 10),
      }),
    };

    navigate("/results", { state: { requestPayload: payload } });
  }

  const inputClass =
    "w-full bg-surface border border-hairline rounded-md px-4 py-2.5 text-paper placeholder:text-muted focus:outline-none focus:border-marigold transition-colors";
  const labelClass = "text-sm text-muted mb-1.5 block";
  const sectionClass = "border border-hairline rounded-xl p-5 bg-surface/80 space-y-4";

  const pageBackground = bgImage
    ? {
        backgroundImage: `linear-gradient(rgba(11,17,32,0.75), rgba(11,17,32,0.85)), url(${bgImage.url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }
    : {};

  return (
    <div style={pageBackground} className="min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <p className="text-marigold text-xs uppercase tracking-wide font-mono mb-2">Find a match</p>
          <h1 className="font-serif text-4xl mb-2">Tell us what you need</h1>
          <p className="text-muted mb-6">
            We'll search 1,500 real Nagpur listings and rank them by fit — no guesswork.
          </p>
        </motion.div>

        <div className={`${sectionClass} mb-6`}>
          <button type="button" onClick={() => setMode(mode === "ai" ? "guided" : "ai")}
            className="text-sm text-marigold flex items-center gap-2">
            <Sparkles size={16} /> {mode === "ai" ? "− Hide" : "Describe what you need in your own words"}
          </button>

          <AnimatePresence>
            {mode === "ai" && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }} className="overflow-hidden">
                <div className="pt-4 space-y-3">
                  <textarea
                    className={`${inputClass} min-h-[110px] resize-none`}
                    placeholder="e.g. I want a commercial shop in a busy locality, small area, budget around 4 lakh."
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                  />
                  <p className="text-xs text-muted">
                    We'll take you straight to your matching properties, ranked by our
                    transparent scoring engine — AI only reads your description, it never decides the ranking.
                  </p>
                  {aiStatus === "error" && <p className="text-risk text-sm">{aiError}</p>}
                  <button type="button" onClick={handleAiParse}
                    disabled={aiQuery.trim().length < 5 || aiStatus === "loading"}
                    className="bg-marigold text-white text-sm font-medium px-5 py-2.5 rounded-md hover:bg-marigoldDim transition-colors disabled:opacity-50">
                    {aiStatus === "loading" ? "Finding properties…" : "Find matching properties"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className={sectionClass}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Purpose *</label>
                <select className={inputClass} value={form.property_type} onChange={(e) => updatePropertyType(e.target.value)}>
                  {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Land type</label>
                <select className={inputClass} value={form.land_type} onChange={(e) => update("land_type", e.target.value)}>
                  <option value="">Any</option>
                  {LAND_TYPES_BY_PROPERTY_TYPE[form.property_type].map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className={sectionClass}>
            <label className={labelClass}>Budget</label>
            <BudgetRangeSlider
              minValue={form.min_budget}
              maxValue={form.max_budget}
              onChange={({ min, max }) => setForm((f) => ({ ...f, min_budget: min, max_budget: max }))}
            />
          </div>

          <div className={sectionClass}>
            <label className={labelClass}>Area</label>
            <div className="grid grid-cols-2 gap-4">
              <input type="number" min="0" className={inputClass} placeholder="Min sq.ft"
                value={form.min_area} onChange={(e) => update("min_area", e.target.value)} />
              <input type="number" min="0" className={inputClass} placeholder="Max sq.ft"
                value={form.max_area} onChange={(e) => update("max_area", e.target.value)} />
            </div>
          </div>

          <div className={sectionClass}>
            <label className={labelClass}>Preferred locality</label>
            <input type="text" className={inputClass} placeholder="e.g. Besa"
              value={form.preferred_locality} onChange={(e) => update("preferred_locality", e.target.value)} />
            {form.preferred_locality && (
              <label className="flex items-center gap-2 text-sm text-muted mt-2">
                <input type="checkbox" checked={form.strict_locality}
                  onChange={(e) => update("strict_locality", e.target.checked)} />
                Only show properties actually in this locality
              </label>
            )}
          </div>

          <div className={sectionClass}>
            <button type="button" onClick={() => setShowFeasibility((s) => !s)}
              className="text-sm text-marigold flex items-center gap-2">
              {showFeasibility ? "− Hide" : "+ Estimate"} development profit potential
            </button>

            <AnimatePresence>
              {showFeasibility && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }} className="overflow-hidden">
                  <div className="space-y-4 pt-4">
                    <div>
                      <label className={labelClass}>Target selling / leasing price per sq.ft (₹)</label>
                      <input type="number" min="0" className={inputClass} placeholder="e.g. 5500"
                        value={form.target_selling_price_per_sqft}
                        onChange={(e) => update("target_selling_price_per_sqft", e.target.value)} />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className={labelClass}>Construction cost / sq.ft</label>
                        <input type="number" min="0" className={inputClass}
                          value={form.construction_cost_per_sqft}
                          onChange={(e) => update("construction_cost_per_sqft", e.target.value)} />
                      </div>
                      <div>
                        <label className={labelClass}>Carpet efficiency (%)</label>
                        <input type="number" min="0" max="100" className={inputClass}
                          value={form.carpet_efficiency_percent}
                          onChange={(e) => update("carpet_efficiency_percent", e.target.value)} />
                      </div>
                      <div>
                        <label className={labelClass}>Buffer (%)</label>
                        <input type="number" min="0" max="100" className={inputClass}
                          value={form.buffer_percent}
                          onChange={(e) => update("buffer_percent", e.target.value)} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {error && <p className="text-risk text-sm">{error}</p>}

          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit"
            className="w-full bg-marigold text-white font-medium py-3.5 rounded-md hover:bg-marigoldDim transition-colors text-base">
            Find Matching Properties
          </motion.button>
        </form>
      </div>
    </div>
  );
}