import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { LoadingState, ErrorState } from "../components/StatusStates";

export default function AdminUsers() {
  const [users, setUsers] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  useEffect(() => { load(); }, []);

  function load() {
    setStatus("loading");
    api.adminListUsers()
      .then((res) => { setUsers(res); setStatus("done"); })
      .catch((err) => { setError(err.message); setStatus("error"); });
  }

  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      <h1 className="font-serif text-2xl mb-6">Registered Users</h1>

      {status === "loading" && <LoadingState label="Loading users…" />}
      {status === "error" && <ErrorState message={error} onRetry={load} />}

      {status === "done" && (
        <div className="overflow-x-auto border border-hairline rounded-xl bg-surface">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-hairline text-muted text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-3">User ID</th>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Age</th>
                <th className="text-left px-4 py-3">Gender</th>
                <th className="text-left px-4 py-3">Contact</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Profession</th>
                <th className="text-left px-4 py-3">Address</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-hairline">
                  <td className="px-4 py-3 font-mono text-xs text-marigold">{u.user_code || "—"}</td>
                  <td className="px-4 py-3">{u.full_name || "—"}</td>
                  <td className="px-4 py-3">{u.age ?? "—"}</td>
                  <td className="px-4 py-3">{u.gender || "—"}</td>
                  <td className="px-4 py-3">{u.phone || "—"}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">{u.profession || "—"}</td>
                  <td className="px-4 py-3 max-w-[200px] truncate">{u.address || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}