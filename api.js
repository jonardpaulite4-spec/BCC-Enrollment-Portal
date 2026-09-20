/* =====================================================================
   API CLIENT — talks to the Node/Express + MySQL backend (see /server).
   The rest of app.js keeps working from in-memory `state` even if the
   backend is offline (e.g. when this file is just opened in a browser);
   when the backend IS reachable, every create/update/delete is mirrored
   to MySQL so data survives a refresh / is shared across devices.
===================================================================== */
// The web portal is served by the API in production and by the Expo shell
// during mobile development. Same-origin is the safest default for both.
const API_BASE_URL = window.API_BASE_URL || `${window.location.origin}/api`;

const Api = {
  online: false, // flipped to true once bootstrap() succeeds

  async _request(path, options = {}) {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    if (!res.ok) {
      let body = "";
      try { body = (await res.json()).error || ""; } catch (e) { /* ignore */ }
      throw new Error(`API ${options.method || "GET"} ${path} failed (${res.status}) ${body}`);
    }
    if (res.status === 204) return null;
    return res.json();
  },

  /* Pulls every table in one round trip so the app can hydrate `state` on load. */
  async bootstrap() {
    const data = await this._request("/bootstrap");
    Api.online = true;
    return data;
  },

  list(resource) { return Api._request(`/${resource}`); },
  create(resource, payload) { return Api._request(`/${resource}`, { method: "POST", body: JSON.stringify(payload) }); },
  update(resource, id, payload) { return Api._request(`/${resource}/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(payload) }); },
  remove(resource, id) { return Api._request(`/${resource}/${encodeURIComponent(id)}`, { method: "DELETE" }); },
};

/* Fire-and-forget wrapper: keeps the UI instant (local `state` already
   mutated + rendered by the caller) while quietly persisting to MySQL.
   Failures are logged, not thrown, so the demo still works with no backend running. */
function syncApi(promiseFactory) {
  if (!Api.online) return;
  try {
    Promise.resolve(promiseFactory()).catch((err) => console.warn("[sync] persistence call failed:", err.message));
  } catch (err) {
    console.warn("[sync] persistence call failed:", err.message);
  }
}