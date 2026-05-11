import { createContext, useContext, useState } from "react"
import { api } from "../api"

const AuthContext = createContext(null)

function getStoredUser() {
  try {
    const stored = localStorage.getItem("lu-user")
    return stored ? JSON.parse(stored) : null
  } catch {
    localStorage.removeItem("lu-user")
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser)

  const login = async ({ email }) => {
    const loggedUser = await api.login(email.trim().toLowerCase())

    const normalizedUser = {
      id: loggedUser.id,
      name: loggedUser.name,
      email: loggedUser.email,
      role: loggedUser.role,
      status: loggedUser.status,
      joinDate: loggedUser.join_date,
    }

    setUser(normalizedUser)
    localStorage.setItem("lu-user", JSON.stringify(normalizedUser))

    return true
  }

  const register = async ({ name, email }) => {
    const newUser = {
      id: Date.now(),
      name,
      email: email.trim().toLowerCase(),
      role: "student",
      status: "active",
      joinDate: new Date().toISOString().slice(0, 10),
    }

    setUser(newUser)
    localStorage.setItem("lu-user", JSON.stringify(newUser))

    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("lu-user")
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)