import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { api } from "../lib/api";
import PropertyRow from "../components/PropertyRow";
import { LoadingState, ErrorState, EmptyState } from "../components/StatusStates";
import { formatINR } from "../lib/format";

const STORAGE_KEY = "last_match_request";

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [requestPayload, setRequestPayload] = useState(null);

  useEffect(() => {
    let payload = location.state?.requestPayload;

    if (!payload) {
      // Refresh or direct navigation lost router state — fall back to the
      // last search this browser tab actually ran, instead of bouncing
      // the user back to an empty form.
      try {
        const saved = sessionStorage.getItem(STORAGE_KEY);
        if (saved) payload = JSON.parse(saved);
      } catch {
        // ignore corrupt storage
      }
    }

    if (!payload) {
      navigate("/requirements");
      return;
    }

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setRequestPayload(payload);
    runSearch(payload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function runSearch(payload) {
    setStatus("loading");
    api.matchProperties(payload)
      .then((res) => { setData(res); setStatus("done"); })
      .catch((err) => { setError(err.message); setStatus("error"); });
  }

  const hasFeasibility = data?.results?.some((p) => p.estimated_profit_inr !== null);
  const chartData = hasFeasibility
    ? data.results.slice(0, 10).map((p, i) => ({
        name: `${i + 1}. ${p.locality || "Unlisted"}`,
        profit: p.estimated_profit_inr,
      }))
    : [];

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="font-serif text-3xl mb-1">Matching results</h1>
      {requestPayload && (
        <p className="text-muted text-sm mb-8">
          {requestPayload.property_type}
          {requestPayload.land_type ? ` · ${requestPayload.land_type}` : ""}
          {requestPayload.preferred_locality ? ` · near ${requestPayload.preferred_locality}` : ""}
          {" · up to " + formatINR(requestPayload.max_budget)}
        </p>
      )}

      {status === "loading" && <LoadingState />}
      {status === "error" && <ErrorState message={error} onRetry={() => runSearch(requestPayload)} />}

      {status === "done" && data && data.total_candidates === 0 && (
        <EmptyState
          title="No properties match these requirements"
          message="No real listing in the database satisfies every hard constraint entered. Try widening the area range or increasing the budget."
        />
      )}

      {status === "done" && data && data.total_candidates > 0 && (
        <>
          <p className="text-sm text-muted mb-4 font-mono">
            {data.total_candidates} candidates matched · showing top {data.returned}
          </p>

          {hasFeasibility && chartData.length > 1 && (
            <div className="border border-hairline rounded-md p-4 mb-6 bg-surface">
              <p className="text-xs text-muted uppercase tracking-wide mb-3">
                Estimated profit — top {chartData.length} results
              </p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData}>
                  <CartesianGrid stroke="#2A3555" vertical={false} />
                  <XAxis dataKey="name" stroke="#8B93B0" fontSize={11} />
                  <YAxis stroke="#8B93B0" fontSize={11} tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`} />
                  <Tooltip
                    contentStyle={{ background: "#1C2540", border: "1px solid #2A3555", borderRadius: 6 }}
                    labelStyle={{ color: "#EDEFF7" }}
                    formatter={(v) => [formatINR(v), "Est. profit"]}
                  />
                  <Bar dataKey="profit" fill="#6366F1" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="space-y-4">
            {data.results.map((p, i) => (
              <PropertyRow key={p.property_id} property={p} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}