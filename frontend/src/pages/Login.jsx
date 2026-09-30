import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: signInError } = await signIn(email, password);
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    navigate("/");
  }

  const inputClass =
    "w-full bg-surface border border-hairline rounded-md px-4 py-2.5 text-paper placeholder:text-muted focus:outline-none focus:border-marigold transition-colors";

  return (
    <div className="max-w-sm mx-auto px-6 py-24">
      <h1 className="font-serif text-2xl mb-1">Sign in</h1>
      <p className="text-muted text-sm mb-8">Access your saved properties and enquiries.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="email" required placeholder="Email" className={inputClass}
          value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" required placeholder="Password" className={inputClass}
          value={password} onChange={(e) => setPassword(e.target.value)} />

        {error && <p className="text-risk text-sm">{error}</p>}

        <button type="submit" disabled={loading}
          className="w-full bg-marigold text-white font-medium py-2.5 rounded-md disabled:opacity-50">
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="text-sm text-muted mt-4">
        New here? <Link to="/register" className="text-marigold hover:underline">Create an account</Link>
      </p>
      <button
        onClick={() => { sessionStorage.setItem("guest_continued", "true"); navigate("/"); }}
        className="text-sm text-muted hover:text-paper mt-3 block"
      >
        Continue browsing as a guest →
      </button>
    </div>
  );
}