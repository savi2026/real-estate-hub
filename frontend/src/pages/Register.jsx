import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "", age: "", gender: "", phone: "", email: "", password: "", profession: "", address: "",
  });
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    const details = {
      full_name: form.full_name,
      age: form.age,
      gender: form.gender,
      phone: form.phone,
      profession: form.profession,
      address: form.address,
    };

    const { data, error: signUpError } = await signUp(form.email, form.password, details);
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      navigate("/");
    } else {
      setInfo("Account created. Please check your email to confirm, then sign in.");
    }
  }

  const inputClass =
    "w-full bg-surface border border-hairline rounded-md px-4 py-2.5 text-paper placeholder:text-muted focus:outline-none focus:border-marigold transition-colors";
  const labelClass = "text-sm text-muted mb-1.5 block";

  return (
    <div className="max-w-lg mx-auto px-6 py-16">
      <h1 className="font-serif text-3xl mb-2">Create your account</h1>
      <p className="text-muted mb-8">Register to save properties, get matches, and track enquiries.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="full_name" className={labelClass}>Full name *</label>
            <input id="full_name" name="full_name" required className={inputClass}
              value={form.full_name} onChange={(e) => update("full_name", e.target.value)} />
          </div>
          <div>
            <label htmlFor="age" className={labelClass}>Age</label>
            <input id="age" name="age" type="number" min="0" max="120" className={inputClass}
              value={form.age} onChange={(e) => update("age", e.target.value)} />
          </div>
        </div>

        <div>
          <label htmlFor="gender" className={labelClass}>Gender</label>
          <select id="gender" name="gender" className={inputClass}
            value={form.gender} onChange={(e) => update("gender", e.target.value)}>
            <option value="">Prefer not to say</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="phone" className={labelClass}>Contact number</label>
          <input id="phone" name="phone" type="tel" className={inputClass}
            value={form.phone} onChange={(e) => update("phone", e.target.value)} />
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>Email *</label>
          <input id="email" name="email" type="email" required className={inputClass}
            value={form.email} onChange={(e) => update("email", e.target.value)} />
        </div>

        <div>
          <label htmlFor="password" className={labelClass}>Password *</label>
          <input id="password" name="password" type="password" required minLength={6} className={inputClass}
            value={form.password} onChange={(e) => update("password", e.target.value)} />
        </div>

        <div>
          <label htmlFor="profession" className={labelClass}>Profession</label>
          <input id="profession" name="profession" className={inputClass}
            value={form.profession} onChange={(e) => update("profession", e.target.value)} />
        </div>

        <div>
          <label htmlFor="address" className={labelClass}>Address</label>
          <textarea id="address" name="address" className={`${inputClass} min-h-[70px] resize-none`}
            value={form.address} onChange={(e) => update("address", e.target.value)} />
        </div>

        {error && <p className="text-risk text-sm">{error}</p>}
        {info && <p className="text-good text-sm">{info}</p>}

        <button type="submit" disabled={loading}
          className="w-full bg-marigold text-white font-medium py-2.5 rounded-md hover:bg-marigoldDim transition-colors disabled:opacity-50">
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="text-sm text-muted mt-4">
        Already have an account? <Link to="/login" className="text-marigold hover:underline">Sign in</Link>
      </p>
    </div>
  );
}