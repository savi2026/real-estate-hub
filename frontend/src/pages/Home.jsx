import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../lib/api";
import { useCountUp } from "../lib/useCountUp";
import { useCategoryImage } from "../lib/useCategoryImage";
import { formatINR } from "../lib/format";
import PropertyImage from "../components/PropertyImage";
import PropertyCard from "../components/PropertyCard";
import { useAuth } from "../lib/AuthContext";

export default function Home() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const heroImage = useCategoryImage("hero_home");
  const [stats, setStats] = useState(null);
  const [types, setTypes] = useState([]);
  const [localities, setLocalities] = useState([]);
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    Promise.all([api.propertyTypeAnalytics(), api.localityAnalytics()])
      .then(([typesRes, locs]) => {
        const total = typesRes.reduce((sum, t) => sum + t.total_properties, 0);
        const avgPrice = typesRes.reduce((sum, t) => sum + t.avg_price * t.total_properties, 0) / total;
        setStats({ total, localities: locs.length, avgPrice });
        setTypes(typesRes);
        setLocalities([...locs].sort((a, b) => b.total_properties - a.total_properties).slice(0, 8));
      })
      .catch(() => setStats(null));

    api.searchProperties({ page: 1, page_size: 6 }).then((res) => setFeatured(res.results)).catch(() => setFeatured([]));
  }, []);

  const totalCount = useCountUp(stats?.total);
  const localityCount = useCountUp(stats?.localities);

  const pageBackground = heroImage
    ? {
        backgroundImage: `linear-gradient(rgba(11,17,32,0.55), rgba(11,17,32,0.75)), url(${heroImage.url})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }
    : {};

  return (
    <div style={pageBackground}>
      <section className="min-h-[75vh] flex items-center">
        <div className="max-w-6xl mx-auto px-6 w-full py-16">
          <div className="max-w-2xl">
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
              className="text-marigold text-sm mb-4 font-mono uppercase tracking-wide">
              Smarter property search for Nagpur
            </motion.p>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
              className="font-serif text-4xl md:text-6xl leading-tight mb-2">
              Find the property
            </motion.h1>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
              className="inline-block bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent font-serif text-4xl md:text-6xl leading-tight mb-6">
              that actually fits what you need.
            </motion.div>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}
              className="text-white/80 text-lg mb-10 max-w-xl">
              Search real Nagpur listings, see exactly why each one matches your
              budget and requirements, and compare your shortlist side by side.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }}
              className="flex gap-4 flex-wrap items-center">
              <button onClick={() => navigate("/requirements")}
                className="bg-marigold text-white font-medium px-6 py-3 rounded-md hover:bg-marigoldDim transition-colors">
                Find a Match
              </button>
              <button onClick={() => navigate("/browse")}
                className="border border-white/40 text-white px-6 py-3 rounded-md hover:border-marigold transition-colors">
                Explore Properties
              </button>
            </motion.div>

            {!session && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                className="flex items-center gap-4 mt-6">
                <span className="text-white/70 text-sm">Already a member?</span>
                <button onClick={() => navigate("/login")} className="text-white hover:text-marigold text-sm font-medium">Login</button>
                <span className="text-white/40">/</span>
                <button onClick={() => navigate("/register")} className="text-white hover:text-marigold text-sm font-medium">Register</button>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      <section className="border-y border-hairline bg-ink/70 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="font-serif text-3xl md:text-4xl text-marigold">{stats ? totalCount.toLocaleString("en-IN") : "-"}+</p>
            <p className="text-xs text-white/70 uppercase tracking-wide mt-1">Properties</p>
          </div>
          <div>
            <p className="font-serif text-3xl md:text-4xl text-marigold">{stats ? localityCount : "-"}</p>
            <p className="text-xs text-white/70 uppercase tracking-wide mt-1">Localities</p>
          </div>
          <div>
            <p className="font-serif text-3xl md:text-4xl text-marigold">{stats ? formatINR(stats.avgPrice) : "-"}</p>
            <p className="text-xs text-white/70 uppercase tracking-wide mt-1">Average Price</p>
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="bg-ink/70 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl">Featured properties</h2>
              <button onClick={() => navigate("/browse")} className="text-sm text-marigold hover:underline">View all -&gt;</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured.map((p, i) => <PropertyCard key={p.property_id} property={p} index={i} />)}
            </div>
          </div>
        </section>
      )}

      {types.length > 0 && (
        <section className="border-t border-hairline bg-ink/70 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <h2 className="font-serif text-2xl mb-6">Explore by property type</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {types.map((t) => (
                <button
                  key={t.property_type}
                  onClick={() => navigate(`/browse?property_type=${encodeURIComponent(t.property_type)}`)}
                  className="relative h-48 rounded-xl overflow-hidden border border-hairline group"
                >
                  <PropertyImage category={t.property_type} className="h-48" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent group-hover:from-ink/90 transition-all" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                    <p className="font-serif text-xl text-white">{t.property_type}</p>
                    <p className="text-xs text-white/70">{t.total_properties} listings</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {localities.length > 0 && (
        <section className="border-t border-hairline bg-ink/70 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <h2 className="font-serif text-2xl mb-6">Popular localities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {localities.map((l) => (
                <button key={l.locality} onClick={() => navigate(`/browse?locality=${encodeURIComponent(l.locality)}`)}
                  className="px-4 py-2.5 rounded-full border border-hairline text-sm hover:border-marigold hover:text-marigold transition-colors text-center truncate">
                  {l.locality} <span className="text-muted">- {l.total_properties}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-hairline bg-ink/70 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="font-serif text-2xl mb-8">Why people use this</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <p className="text-marigold text-2xl mb-2">*</p>
              <p className="font-medium mb-1">Real Nagpur data</p>
              <p className="text-sm text-white/70">1,500 real listings across 39 localities - no filler.</p>
            </div>
            <div>
              <p className="text-marigold text-2xl mb-2">*</p>
              <p className="font-medium mb-1">Transparent scoring</p>
              <p className="text-sm text-white/70">Every match comes with the exact reasons it ranked where it did.</p>
            </div>
            <div>
              <p className="text-marigold text-2xl mb-2">*</p>
              <p className="font-medium mb-1">Compare with confidence</p>
              <p className="text-sm text-white/70">Shortlist and compare properties side by side before deciding.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-hairline bg-ink/70 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <h2 className="font-serif text-2xl mb-4">Ready to find your next property?</h2>
          <button onClick={() => navigate("/requirements")}
            className="bg-marigold text-white font-medium px-6 py-3 rounded-md hover:bg-marigoldDim transition-colors">
            Get Started
          </button>
        </div>
      </section>
    </div>
  );
}