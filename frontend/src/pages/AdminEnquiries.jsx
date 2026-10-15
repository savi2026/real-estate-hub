import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { LoadingState, ErrorState } from "../components/StatusStates";

const STATUS_COLORS = { new: "text-marigold", contacted: "text-good", closed: "text-muted" };

export default function AdminEnquiries() {
  const [statusFilter, setStatusFilter] = useState("");
  const [enquiries, setEnquiries] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  useEffect(() => { load(); }, [statusFilter]);

  function load() {
    setStatus("loading");
    api.adminListEnquiries(statusFilter)
      .then((res) => { setEnquiries(res); setStatus("done"); })
      .catch((err) => { setError(err.message); setStatus("error"); });
  }

  async function changeStatus(id, newStatus) {
    try {
      await api.adminUpdateEnquiryStatus(id, newStatus);
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl">Enquiries</h1>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-surface border border-hairline rounded px-3 py-1.5 text-sm">
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {status === "loading" && <LoadingState label="Loading enquiries…" />}
      {status === "error" && <ErrorState message={error} onRetry={load} />}

      {status === "done" && enquiries.length === 0 && (
        <p className="text-sm text-muted">No enquiries yet.</p>
      )}

      {status === "done" && enquiries.length > 0 && (
        <div className="space-y-3">
          {enquiries.map((e) => (
            <div key={e.id} className="border border-hairline rounded-xl p-4 bg-surface">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-sm">
                    <span className="font-medium">{e.full_name || e.email}</span>
                    <span className="text-muted"> · {e.user_code}</span>
                  </p>
                  <p className="text-xs text-muted">{e.email} {e.phone ? `· ${e.phone}` : ""}</p>
                </div>
                <span className={`text-xs font-mono uppercase ${STATUS_COLORS[e.status]}`}>{e.status}</span>
              </div>

              <p className="text-sm mt-2">
                Property:{" "}
                <a href={`/properties/${e.property_id}`} target="_blank" rel="noopener noreferrer"
                  className="font-mono text-marigold hover:underline">
                  {e.property_id}
                </a>
                {" "}— {e.locality}
              </p>
              {e.message && <p className="text-sm text-muted mt-1 italic">"{e.message}"</p>}
              <p className="text-[11px] text-muted mt-1">{new Date(e.created_at).toLocaleString()}</p>

              <div className="flex gap-2 mt-3">
                {["new", "contacted", "closed"].map((s) => (
                  <button
                    key={s}
                    onClick={() => changeStatus(e.id, s)}
                    disabled={e.status === s}
                    className="text-xs px-3 py-1 border border-hairline rounded hover:border-marigold disabled:opacity-30"
                  >
                    Mark {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}