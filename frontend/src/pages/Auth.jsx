import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Home, LogIn, UserPlus } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import styles from "./Auth.module.css"

export default function Auth() {
  const navigate = useNavigate()
  const { login, register } = useAuth()
  const [mode, setMode] = useState("login")
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [error, setError] = useState("")

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = (e) => {
    e.preventDefault()
    setError("")
    if (mode === "login") {
      const ok = login({ email: form.email, password: form.password })
      if (ok) navigate("/")
      else setError("Invalid email or password.")
    } else {
      if (!form.name.trim()) { setError("Please enter your name."); return }
      const ok = register({ name: form.name, email: form.email, password: form.password })
      if (ok) navigate("/")
      else setError("Could not create account.")
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logo}>
          <Home size={22} />
          <span>LU Housing</span>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${mode === "login" ? styles.active : ""}`}
            onClick={() => setMode("login")}
          >
            <LogIn size={15} /> Sign in
          </button>
          <button
            className={`${styles.tab} ${mode === "register" ? styles.active : ""}`}
            onClick={() => setMode("register")}
          >
            <UserPlus size={15} /> Create account
          </button>
        </div>

        <form onSubmit={submit} className={styles.form}>
          {mode === "register" && (
            <div className={styles.field}>
              <label>Full name</label>
              <input
                name="name"
                type="text"
                placeholder="Celine Asante"
                value={form.name}
                onChange={handle}
                className="input"
                required
              />
            </div>
          )}

          <div className={styles.field}>
            <label>University email</label>
            <input
              name="email"
              type="email"
              placeholder="student@lu.edu"
              value={form.email}
              onChange={handle}
              className="input"
              required
            />
          </div>

          <div className={styles.field}>
            <label>Password</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handle}
              className="input"
              required
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px" }}>
            {mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className={styles.hint}>
          {mode === "login"
            ? "Don't have an account? "
            : "Already have an account? "}
          <button
            className={styles.switchBtn}
            onClick={() => setMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "Register here" : "Sign in instead"}
          </button>
        </p>

        <p className={styles.note}>
          Only students with a university email address may register.
        </p>
      </div>
    </div>
  )
}
