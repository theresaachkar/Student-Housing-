import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Home, LogIn, UserPlus, Eye, EyeOff, AlertCircle } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import styles from "./Auth.module.css"

// Detect role from email — used to show the user what they're registering as
function detectRole(email) {
  const e = email.toLowerCase()
  if (e.includes("admin")) return "admin"
  if (e.includes("landlord")) return "landlord"
  if (e.includes("student")) return "student"
  return null
}

export default function Auth() {
  const navigate = useNavigate()
  const { login, register } = useAuth()

  const [mode, setMode] = useState("login")
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handle = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError("")
  }

  // ── Client-side validation for register ──────────────────────────────────
  const validateRegister = () => {
    if (!form.name.trim()) return "Please enter your full name."

    const role = detectRole(form.email)

    if (role === "admin") {
      return "Admin accounts cannot be self-registered."
    }
    if (role !== "student" && role !== "landlord") {
      return "Your email must contain 'student' or 'landlord' (e.g. john.student@mail.com or jane.landlord@mail.com)."
    }
    if (form.password.length < 6) return "Password must be at least 6 characters."
    if (form.password !== form.confirm) return "Passwords do not match."

    return null
  }

  const submit = async (e) => {
    e.preventDefault()
    setError("")

    if (mode === "register") {
      const validationError = validateRegister()
      if (validationError) {
        setError(validationError)
        return
      }
    }

    setLoading(true)

    let result
    if (mode === "login") {
      result = await login({ email: form.email, password: form.password })
    } else {
      result = await register({ name: form.name, email: form.email, password: form.password })
    }

    setLoading(false)

    if (!result.success) {
      setError(result.error)
      return
    }

    // Redirect based on role
    const role = result.user.role
    if (role === "admin") navigate("/admin")
    else if (role === "landlord") navigate("/landlord")
    else navigate("/")
  }

  const role = mode === "register" ? detectRole(form.email) : null
  const rolePillVisible = role === "student" || role === "landlord"

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logo}>
          <Home size={20} />
          <span>LU Housing</span>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${mode === "login" ? styles.active : ""}`}
            onClick={() => { setMode("login"); setError("") }}
          >
            <LogIn size={14} /> Sign in
          </button>
          <button
            className={`${styles.tab} ${mode === "register" ? styles.active : ""}`}
            onClick={() => { setMode("register"); setError("") }}
          >
            <UserPlus size={14} /> Create account
          </button>
        </div>

        <form onSubmit={submit} className={styles.form}>
          {/* Name — register only */}
          {mode === "register" && (
            <div className={styles.field}>
              <label>Full name</label>
              <input
                name="name"
                type="text"
                placeholder="e.g. Celine Al Dassouki"
                value={form.name}
                onChange={handle}
                className="input"
                required
              />
            </div>
          )}

          {/* Email */}
          <div className={styles.field}>
            <label>Email address</label>
            <input
              name="email"
              type="email"
              placeholder={mode === "register" ? "must contain 'student' or 'landlord'" : "your@email.com"}
              value={form.email}
              onChange={handle}
              className="input"
              required
            />
            {/* Role pill — shows live as user types */}
            {rolePillVisible && (
              <span className={`${styles.rolePill} ${styles[role]}`}>
                Registering as: {role}
              </span>
            )}
            {mode === "register" && form.email && !rolePillVisible && !error && (
              <span className={styles.emailHint}>
                Email must contain "student" or "landlord"
              </span>
            )}
          </div>

          {/* Password */}
          <div className={styles.field}>
            <label>Password</label>
            <div className={styles.pwWrap}>
              <input
                name="password"
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={handle}
                className="input"
                required
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPw(!showPw)}
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Confirm password — register only */}
          {mode === "register" && (
            <div className={styles.field}>
              <label>Confirm password</label>
              <input
                name="confirm"
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                value={form.confirm}
                onChange={handle}
                className="input"
                required
              />
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className={styles.error}>
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "12px" }}
            disabled={loading}
          >
            {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className={styles.hint}>
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button
            className={styles.switchBtn}
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError("") }}
          >
            {mode === "login" ? "Register here" : "Sign in instead"}
          </button>
        </p>

        {mode === "register" && (
          <p className={styles.note}>
            Only students and landlords can register. One admin account exists and cannot be created here.
          </p>
        )}
      </div>
    </div>
  )
}
