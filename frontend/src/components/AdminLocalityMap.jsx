import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { api } from "../lib/api";

const CACHE_PREFIX = "geocode_";

async function geocodeLocality(locality) {
  const cacheKey = CACHE_PREFIX + locality.toLowerCase();
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) return JSON.parse(cached);

  const query = encodeURIComponent(`${locality}, Nagpur, Maharashtra, India`);
  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${query}`);
  if (!res.ok) {
    console.warn(`Geocoding failed for ${locality}: HTTP ${res.status}`);
    return null;
  }
  const data = await res.json();
  const coords = data && data.length > 0 ? [parseFloat(data[0].lat), parseFloat(data[0].lon)] : null;
  sessionStorage.setItem(cacheKey, JSON.stringify(coords));
  return coords;
}

export default function AdminLocalityMap() {
  const [points, setPoints] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const localities = await api.localityAnalytics();
        const top = [...localities].sort((a, b) => b.total_properties - a.total_properties).slice(0, 8);
        const results = [];
        for (const l of top) {
          if (cancelled) return;
          try {
            const coords = await geocodeLocality(l.locality);
            if (coords) results.push({ ...l, coords });
          } catch (err) {
            console.warn(`Geocoding error for ${l.locality}:`, err.message);
          }
          // Nominatim's usage policy caps requests at 1 per second — must respect this
          await new Promise((r) => setTimeout(r, 1100));
        }
        if (!cancelled) { setPoints(results); setStatus(results.length > 0 ? "done" : "error"); }
      } catch (err) {
        console.warn("Locality map failed to load:", err.message);
        if (!cancelled) setStatus("error");
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (status === "loading") {
    return <div className="h-72 flex items-center justify-center text-sm text-muted border border-hairline rounded-xl bg-surface">Loading locality map (this respects OpenStreetMap's rate limit, so it takes a few seconds)…</div>;
  }
  if (status === "error" || points.length === 0) {
    return <div className="h-72 flex items-center justify-center text-sm text-muted border border-hairline rounded-xl bg-surface">Map temporarily unavailable — check the browser console for details.</div>;
  }

  return (
    <div className="h-72 rounded-xl overflow-hidden border border-hairline">
      <MapContainer center={points[0].coords} zoom={11} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
        <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {points.map((p) => (
          <CircleMarker
            key={p.locality}
            center={p.coords}
            radius={Math.max(6, Math.min(20, p.total_properties / 3))}
            pathOptions={{ color: "#6366F1", fillColor: "#6366F1", fillOpacity: 0.5 }}
          >
            <Popup>{p.locality}<br />{p.total_properties} listings</Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}