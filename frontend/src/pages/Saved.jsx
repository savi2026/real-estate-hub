import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useSaved } from "../lib/SaveContext";
import PropertyCard from "../components/PropertyCard";
import { LoadingState, ErrorState, EmptyState } from "../components/StatusStates";

export default function Saved() {
  const { ids, loaded } = useSaved();
  const [properties, setProperties] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!loaded) return;
    if (ids.length === 0) { setStatus("done"); setProperties([]); return; }
    setStatus("loading");
    Promise.all(ids.map((id) => api.getProperty(id).catch(() => null)))
      .then((res) => { setProperties(res.filter(Boolean)); setStatus("done"); })
      .catch((err) => { setError(err.message); setStatus("error"); });
  }, [ids, loaded]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="font-serif text-3xl mb-6">Saved Properties</h1>

      {status === "loading" && <LoadingState label="Loading saved properties…" />}
      {status === "error" && <ErrorState message={error} />}
      {status === "done" && properties?.length === 0 && (
        <EmptyState title="No saved properties yet" message="Tap the heart icon on any property card to save it here." />
      )}
      {status === "done" && properties?.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map((p, i) => <PropertyCard key={p.property_id} property={p} index={i} />)}
        </div>
      )}
    </div>
  );
}