import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { supabase } from "../lib/supabaseClient";

export default function AdminLogin() {
  const { signIn, signOut } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: signInError } = await signIn(email, password);
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    // Use the token from THIS sign-in response directly — never a separate
    // getSession() call, which can race ahead of Supabase's internal state.
    const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
    try {
      const res = await fetch(`${base}/auth/me`, {
        headers: { Authorization: `Bearer ${data.session.access_token}` },
      });
      const me = await res.json();

      if (!res.ok || me.role !== "admin") {
        await signOut();
        setError("This account does not have admin access.");
        setLoading(false);
        return;
      }

      navigate("/admin");
    } catch {
      await signOut();
      setError("Could not verify admin access. Please try again.");
    }
    setLoading(false);
  }

  const inputClass =
    "w-full bg-surface border border-hairline rounded-md px-4 py-2.5 text-paper placeholder:text-muted focus:outline-none focus:border-marigold transition-colors";

  return (
    <div className="max-w-sm mx-auto px-6 py-24">
      <h1 className="font-serif text-2xl mb-1">Admin sign in</h1>
      <p className="text-muted text-sm mb-8">Restricted access. Authorized administrators only.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="email" required placeholder="Admin email" className={inputClass}
          value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" required placeholder="Password" className={inputClass}
          value={password} onChange={(e) => setPassword(e.target.value)} />

        {error && <p className="text-risk text-sm">{error}</p>}

        <button type="submit" disabled={loading}
          className="w-full bg-marigold text-white font-medium py-2.5 rounded-md disabled:opacity-50">
          {loading ? "Verifying..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}