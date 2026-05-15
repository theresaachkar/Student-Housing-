import { createContext, useContext, useEffect, useState } from "react"

const AuthContext = createContext(null)

const API = "http://localhost:8000"

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem("lu_user")
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem("lu_user")
      }
    }
    setLoading(false)
  }, [])

  const login = async ({ email, password }) => {
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      })
      const data = await res.json()
      if (!res.ok) return { success: false, error: data.detail || "Login failed." }
      setUser(data)
      localStorage.setItem("lu_user", JSON.stringify(data))
      return { success: true, user: data }
    } catch {
      return { success: false, error: "Cannot reach the server. Make sure the backend is running." }
    }
  }

  const register = async ({ name, email, password }) => {
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), password }),
      })
      const data = await res.json()
      if (!res.ok) return { success: false, error: data.detail || "Registration failed." }
      setUser(data)
      localStorage.setItem("lu_user", JSON.stringify(data))
      return { success: true, user: data }
    } catch {
      return { success: false, error: "Cannot reach the server. Make sure the backend is running." }
    }
  }

  const updateUser = async ({ name, phone }) => {
    try {
      const res = await fetch(`${API}/api/users/${user.id}/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
      })
      const data = await res.json()
      if (!res.ok) return { success: false, error: data.detail || "Update failed." }
      // Update state and localStorage so navbar name refreshes immediately
      setUser(data)
      localStorage.setItem("lu_user", JSON.stringify(data))
      return { success: true, user: data }
    } catch {
      return { success: false, error: "Cannot reach the server. Make sure the backend is running." }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("lu_user")
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
