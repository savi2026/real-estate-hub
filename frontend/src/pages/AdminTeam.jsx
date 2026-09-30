import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../lib/AuthContext";
import { LoadingState, ErrorState } from "../components/StatusStates";

export default function AdminTeam() {
  const { profile } = useAuth();
  const [admins, setAdmins] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [email, setEmail] = useState("");
  const [promoteMsg, setPromoteMsg] = useState(null);
  const [promoteErr, setPromoteErr] = useState(null);

  useEffect(() => { load(); }, []);

  function load() {
    setStatus("loading");
    api.adminListTeam()
      .then((res) => { setAdmins(res); setStatus("done"); })
      .catch((err) => { setError(err.message); setStatus("error"); });
  }

  async function demote(u) {
    try {
      await api.adminDemoteUser(u.id);
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handlePromote(e) {
    e.preventDefault();
    setPromoteMsg(null);
    setPromoteErr(null);
    try {
      const res = await api.adminPromoteByEmail(email);
      setPromoteMsg(res.message);
      setEmail("");
      load();
    } catch (err) {
      setPromoteErr(err.message);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-8 py-10">
      <h1 className="font-serif text-2xl mb-2">Team Access</h1>
      <p className="text-sm text-muted mb-6">
        Only administrators appear here — registered customers are managed separately under "User Details."
      </p>

      <form onSubmit={handlePromote} className="border border-hairline rounded-xl p-4 bg-surface mb-8 flex gap-3">
        <input
          type="email" required placeholder="Registered user's email to promote"
          value={email} onChange={(e) => setEmail(e.target.value)}
          className="flex-1 bg-surfaceRaised border border-hairline rounded-md px-3 py-2 text-sm text-paper focus:outline-none focus:border-marigold"
        />
        <button type="submit" className="bg-marigold text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-marigoldDim">
          Make admin
        </button>
      </form>
      {promoteMsg && <p className="text-good text-sm mb-4">{promoteMsg}</p>}
      {promoteErr && <p className="text-risk text-sm mb-4">{promoteErr}</p>}

      {status === "loading" && <LoadingState label="Loading team…" />}
      {status === "error" && <ErrorState message={error} onRetry={load} />}

      {status === "done" && (
        <div className="space-y-2">
          {admins.map((u) => (
            <div key={u.id} className="border border-hairline rounded-md p-4 flex items-center justify-between bg-surface">
              <p className="text-sm">{u.email}</p>
              <button
                onClick={() => demote(u)}
                disabled={u.id === profile?.id}
                className="text-xs px-3 py-1.5 border border-hairline rounded hover:border-marigold disabled:opacity-30"
              >
                Revoke admin
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}