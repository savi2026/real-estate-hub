import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const CACHE_PREFIX = "geocode_";

export default function PropertyMap({ locality, subLocality }) {
  const [position, setPosition] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (!locality) { setStatus("unavailable"); return; }

    const cacheKey = CACHE_PREFIX + locality.toLowerCase();
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      setPosition(parsed);
      setStatus(parsed ? "found" : "unavailable");
      return;
    }

    setStatus("loading");
    const query = encodeURIComponent(`${locality}, Nagpur, Maharashtra, India`);
    fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${query}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          const coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
          sessionStorage.setItem(cacheKey, JSON.stringify(coords));
          setPosition(coords);
          setStatus("found");
        } else {
          sessionStorage.setItem(cacheKey, JSON.stringify(null));
          setStatus("unavailable");
        }
      })
      .catch(() => setStatus("unavailable"));
  }, [locality]);

  if (status === "loading") {
    return <div className="h-64 rounded-md border border-hairline flex items-center justify-center text-sm text-muted">Loading map…</div>;
  }

  if (status === "unavailable") {
    return (
      <div className="h-64 rounded-md border border-hairline flex items-center justify-center text-sm text-muted text-center px-6">
        Exact map location isn't available for this locality yet.
      </div>
    );
  }

  return (
    <div>
      <div className="h-64 rounded-md overflow-hidden border border-hairline">
        <MapContainer center={position} zoom={14} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>{locality}{subLocality ? `, ${subLocality}` : ""}<br />Approximate locality area</Popup>
          </Marker>
        </MapContainer>
      </div>
      <p className="text-[11px] text-muted mt-1.5">
        Approximate location of {locality} — the exact plot boundary isn't in our data.
      </p>
    </div>
  );
}