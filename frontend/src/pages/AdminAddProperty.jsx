import { useState } from "react";
import { api } from "../lib/api";
import { LAND_TYPES_BY_PROPERTY_TYPE } from "../lib/landTypes";

const PROPERTY_TYPES = ["Residential", "Commercial", "Agriculture"];
const LAND_TYPES = [
  "Apartment", "Residential Plot", "Independent House", "Agricultural Land",
  "Villa", "Shop", "Builder Floor", "Office", "Commercial Plot", "Farm Plot", "Warehouse",
];

const EMPTY = {
  locality: "", sub_locality: "", address: "", pincode: "",
  property_type: "Residential", land_type: "Residential Plot",
  new_resale: "New", area_sqft: "", plot_length_ft: "", plot_width_ft: "",
  asking_price_inr: "", facing: "", main_road: "Yes", ownership_type: "",
  fsi: "", nmrda_nit_approval: "", legal_status: "Documentation Pending",
};

export default function AdminAddProperty() {
  const [form, setForm] = useState(EMPTY);
  const [duplicates, setDuplicates] = useState([]);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function buildPayload(forceAdd) {
    const payload = { ...form, force_add: forceAdd };
    for (const key of ["pincode", "area_sqft", "plot_length_ft", "plot_width_ft", "asking_price_inr", "fsi"]) {
      payload[key] = payload[key] === "" ? undefined : Number(payload[key]);
    }
    for (const key of Object.keys(payload)) {
      if (payload[key] === "") payload[key] = undefined;
    }
    return payload;
  }

  async function handleSubmit(e, forceAdd = false) {
    e?.preventDefault();
    setError(null);
    setMessage(null);
    try {
      const res = await api.adminCreateProperty(buildPayload(forceAdd));
      if (!res.created) {
        setDuplicates(res.potential_duplicates);
        setMessage(res.message);
      } else {
        setMessage(`Added successfully as ${res.property_id}`);
        setDuplicates([]);
        setForm(EMPTY);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  const inputClass =
    "w-full bg-surface border border-hairline rounded-md px-3 py-2 text-sm text-paper placeholder:text-muted focus:outline-none focus:border-marigold";
  const labelClass = "text-xs text-muted mb-1 block";

  return (
    <div className="max-w-xl mx-auto px-6 py-12">
      <h1 className="font-serif text-2xl mb-6">Add property</h1>

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Locality *</label>
            <input required className={inputClass} value={form.locality} onChange={(e) => update("locality", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Sub-locality</label>
            <input className={inputClass} value={form.sub_locality} onChange={(e) => update("sub_locality", e.target.value)} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Address</label>
          <input className={inputClass} value={form.address} onChange={(e) => update("address", e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Property type *</label>
            <select className={inputClass} value={form.property_type} onChange={(e) => setForm((f) => ({ ...f, property_type: e.target.value, land_type: "" }))}>
              {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Land type *</label>
            <select className={inputClass} value={form.land_type} onChange={(e) => update("land_type", e.target.value)}>
              {LAND_TYPES_BY_PROPERTY_TYPE[form.property_type].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelClass}>Area (sq.ft) *</label>
            <input type="number" required className={inputClass} value={form.area_sqft} onChange={(e) => update("area_sqft", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Asking price (₹) *</label>
            <input type="number" required className={inputClass} value={form.asking_price_inr} onChange={(e) => update("asking_price_inr", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>FSI</label>
            <input type="number" step="0.01" className={inputClass} value={form.fsi} onChange={(e) => update("fsi", e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelClass}>Facing</label>
            <input className={inputClass} value={form.facing} onChange={(e) => update("facing", e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>New / Resale</label>
            <select className={inputClass} value={form.new_resale} onChange={(e) => update("new_resale", e.target.value)}>
              <option>New</option>
              <option>Resale</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Legal status</label>
            <select className={inputClass} value={form.legal_status} onChange={(e) => update("legal_status", e.target.value)}>
              <option>Clear Title</option>
              <option>Registry Ready</option>
              <option>Bank Loan Eligible</option>
              <option>Documentation Pending</option>
              <option>Title Verification Pending</option>
              <option>Dispute Check Required</option>
            </select>
          </div>
        </div>

        {error && <p className="text-risk text-sm">{error}</p>}
        {message && <p className="text-sm text-marigold">{message}</p>}

        {duplicates.length > 0 && (
          <div className="border border-marigold/40 bg-marigold/10 rounded-md p-4">
            <p className="text-sm mb-2">Possible existing matches:</p>
            {duplicates.map((d) => (
              <p key={d.property_id} className="text-xs text-muted font-mono">
                {d.property_id} — {d.locality} · {d.area_sqft} sqft · ₹{d.asking_price_inr.toLocaleString("en-IN")}
              </p>
            ))}
            <button
              onClick={(e) => handleSubmit(e, true)}
              className="mt-3 text-xs px-3 py-1.5 border border-hairline rounded hover:border-marigold"
            >
              Add anyway
            </button>
          </div>
        )}

        <button type="submit" className="w-full bg-marigold text-ink font-medium py-2.5 rounded-md">
          Add property
        </button>
      </form>
    </div>
  );
}