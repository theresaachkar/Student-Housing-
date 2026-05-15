const API = "http://localhost:8000"

export const api = {
  getUsers: async () => {
    const res = await fetch(`${API}/api/users`)
    if (!res.ok) throw new Error("Failed to fetch users")
    return res.json()
  },

  deactivateUser: async (id) => {
    const res = await fetch(`${API}/api/users/${id}/deactivate`, { method: "PATCH" })
    if (!res.ok) throw new Error("Failed to deactivate user")
    return res.json()
  },

  reactivateUser: async (id) => {
    const res = await fetch(`${API}/api/users/${id}/reactivate`, { method: "PATCH" })
    if (!res.ok) throw new Error("Failed to reactivate user")
    return res.json()
  },
}
