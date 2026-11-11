
// All communication with the FastAPI backend lives in this file.

// Use the same Vercel domain and route API requests through /api.
// VITE_API_URL can override this for local development.

export const API_BASE = (
  import.meta.env.VITE_API_URL || "/api"
).replace(/\/$/, "");

async function request(path, options) {
  let res;

  try {
    res = await fetch(`${API_BASE}${path}`, options);
  } catch {
    throw new Error(
      `Cannot reach the API at ${API_BASE}. Please check your connection.`
    );
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`;

    try {
      const body = await res.json();

      if (Array.isArray(body.detail)) {
        message = body.detail
          .map((d) => `${d.loc.slice(1).join(".")}: ${d.msg}`)
          .join("; ");
      } else if (typeof body.detail === "string") {
        message = body.detail;
      }
    } catch {
      // Keep the default error message.
    }

    throw new Error(message);
  }

  return res.json();
}

const post = (path, payload) =>
  request(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

export const getHealth = () => request("/health");
export const getModels = () => request("/models");
export const getOptions = () => request("/options");
export const getModelInfo = () => request("/model-info");

export const predict = (payload) =>
  post("/predict", payload);

export const predictAll = (payload) =>
  post("/predict-all", payload);
