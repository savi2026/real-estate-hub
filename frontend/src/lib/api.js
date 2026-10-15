import { supabase } from "./supabaseClient";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

async function request(path, options = {}, authed = false) {
  const headers = { "Content-Type": "application/json" };

  if (authed) {
    const { data } = await supabase.auth.getSession();
    if (data.session) headers["Authorization"] = `Bearer ${data.session.access_token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, { headers, ...options, signal: controller.signal });
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("Request timed out. Please check your connection and try again.");
    }
    throw new Error("Could not reach the server. Is the backend running?");
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    let detail = "Something went wrong. Please try again.";
    try {
      const body = await res.json();
      if (body?.detail) detail = typeof body.detail === "string" ? body.detail : "Please check your input.";
    } catch {
      // response wasn't JSON — keep generic message
    }
    const error = new Error(detail);
    error.status = res.status;
    throw error;
  }

  return res.status === 204 ? null : res.json();
}

export const api = {
  health: () => request("/health"),
  matchProperties: (payload) => request("/match", { method: "POST", body: JSON.stringify(payload) }),
  searchProperties: (payload) => request("/properties/search", { method: "POST", body: JSON.stringify(payload) }),
  getProperty: (id) => request(`/properties/${encodeURIComponent(id)}`),
  localityAnalytics: () => request("/analytics/localities"),
  propertyTypeAnalytics: () => request("/analytics/property-types"),
  listingTrend: () => request("/analytics/listing-trend"),
  newResaleSplit: () => request("/analytics/new-resale-split"),
  getCategoryImage: (category, seed = "") =>
    request(`/images/category?category=${encodeURIComponent(category)}${seed ? `&seed=${encodeURIComponent(seed)}` : ""}`),
  parseRequirement: (query) => request("/match/parse", { method: "POST", body: JSON.stringify({ query }) }),

  updateProfile: (payload) => request("/auth/me", { method: "PATCH", body: JSON.stringify(payload) }, true),

  adminListProperties: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/admin/properties${qs ? `?${qs}` : ""}`, {}, true);
  },
  adminCreateProperty: (payload) =>
    request("/admin/properties", { method: "POST", body: JSON.stringify(payload) }, true),
  adminUpdateProperty: (id, payload) =>
    request(`/admin/properties/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(payload) }, true),
  adminSetStatus: (id, status) =>
    request(`/admin/properties/${encodeURIComponent(id)}/status`, {
      method: "PATCH", body: JSON.stringify({ status }),
    }, true),
  adminDeleteProperty: (id) =>
    request(`/admin/properties/${encodeURIComponent(id)}`, { method: "DELETE" }, true),
  adminListUsers: () => request("/admin/users", {}, true),
  adminPromoteUser: (id) => request(`/admin/users/${encodeURIComponent(id)}/promote`, { method: "POST" }, true),
  adminDemoteUser: (id) => request(`/admin/users/${encodeURIComponent(id)}/demote`, { method: "POST" }, true),
  adminDashboardSummary: () => request("/admin/summary", {}, true),
  adminListTeam: () => request("/admin/team", {}, true),
  adminPromoteByEmail: (email) => request("/admin/team/promote", { method: "POST", body: JSON.stringify({ email }) }, true),
  createEnquiry: (property_id, message) => request("/enquiries", { method: "POST", body: JSON.stringify({ property_id, message }) }, true),
  myEnquiryStatus: (property_id) => request(`/enquiries/status?property_id=${encodeURIComponent(property_id)}`, {}, true),
  myEnquiries: () => request("/enquiries/mine", {}, true),
  adminListEnquiries: (status) => request(`/admin/enquiries${status ? `?status=${status}` : ""}`, {}, true),
  adminUpdateEnquiryStatus: (id, status) =>
    request(`/admin/enquiries/${encodeURIComponent(id)}/status`, { method: "PATCH", body: JSON.stringify({ status }) }, true),
  listSaved: () => request("/saved", {}, true),
  toggleSaved: (propertyId) => request(`/saved/${encodeURIComponent(propertyId)}/toggle`, { method: "POST" }, true),
};