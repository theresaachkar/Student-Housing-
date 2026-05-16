const API_URL = "http://127.0.0.1:8000"

export async function apiRequest(path, options = {}) {
  const isFormData = options.body instanceof FormData
  const response = await fetch(`${API_URL}${path}`, {
    headers: isFormData
      ? {}
      : { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || "API request failed")
  }

  return response.json()
}

export const api = {
  login: (email) =>
    apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  getUsers: () => apiRequest("/api/users"),

  deactivateUser: (id) =>
    apiRequest(`/api/users/${id}/deactivate`, {
      method: "PATCH",
    }),

  reactivateUser: (id) =>
    apiRequest(`/api/users/${id}/reactivate`, {
      method: "PATCH",
    }),

  getListings: () => apiRequest("/api/listings"),

  getApprovedListings: () => apiRequest("/api/listings/approved"),

  getListing: (id) => apiRequest(`/api/listings/${id}`),

  approveListing: (id) =>
    apiRequest(`/api/listings/${id}/approve`, {
      method: "PATCH",
    }),

  rejectListing: (id, reason) =>
    apiRequest(`/api/listings/${id}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    }),

  removeListing: (id, reason) =>
    apiRequest(`/api/listings/${id}`, {
      method: "DELETE",
      body: JSON.stringify({ reason }),
    }),

  createListing: (formData) =>
    apiRequest("/api/listings", {
      method: "POST",
      body: formData,
    }),

  updateListing: (id, formData) =>
    apiRequest(`/api/listings/${id}`, {
      method: "PATCH",
      body: formData,
    }),

  toggleAvailability: (id) =>
    apiRequest(`/api/listings/${id}/toggle-availability`, {
      method: "PATCH",
    }),

  softDeleteListing: (id) =>
    apiRequest(`/api/listings/${id}/soft-delete`, {
      method: "PATCH",
    }),
}