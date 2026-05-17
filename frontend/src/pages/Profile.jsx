import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { User, Phone, Mail, Shield, CheckCircle, AlertCircle } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import styles from "./Profile.module.css"

const ROLE_LABELS = {
  student: { label: "Student", color: styles.roleStudent },
  landlord: { label: "Landlord", color: styles.roleLandlord },
  admin: { label: "Admin", color: styles.roleAdmin },
}

export default function Profile() {
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()

  const [form, setForm] = useState({ name: "", phone: "" })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  // Pre-fill form with current user data
  useEffect(() => {
    if (!user) { navigate("/auth"); return }
    setForm({ name: user.name || "", phone: user.phone || "" })
  }, [user, navigate])

  const handle = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setSuccess(false)
    setError("")
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setError("Name cannot be empty."); return }

    setLoading(true)
    setError("")
    setSuccess(false)

    const result = await updateUser({ name: form.name, phone: form.phone })

    setLoading(false)

    if (!result.success) {
      setError(result.error)
    } else {
      setSuccess(true)
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  if (!user) return null

  const roleInfo = ROLE_LABELS[user.role] || { label: user.role, color: "" }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className="section-title">My Profile</h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>
            Update your name and phone number
          </p>
        </div>

        <div className={styles.layout}>
          {/* Left — avatar + read-only info */}
          <aside className={styles.sidebar}>
            <div className={styles.avatarCard}>
              <div className={styles.avatar}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h2 className={styles.userName}>{user.name}</h2>
              <span className={`${styles.roleBadge} ${roleInfo.color}`}>
                {roleInfo.label}
              </span>
            </div>

            <div className={styles.infoCard}>
              <div className={styles.infoRow}>
                <Mail size={15} />
                <div>
                  <p className={styles.infoLabel}>Email</p>
                  <p className={styles.infoValue}>{user.email}</p>
                </div>
              </div>
              <div className={styles.infoRow}>
                <Shield size={15} />
                <div>
                  <p className={styles.infoLabel}>Account status</p>
                  <p className={`${styles.infoValue} ${user.status === "active" ? styles.active : styles.inactive}`}>
                    {user.status}
                  </p>
                </div>
              </div>
              <div className={styles.infoRow}>
                <User size={15} />
                <div>
                  <p className={styles.infoLabel}>Member since</p>
                  <p className={styles.infoValue}>{user.join_date}</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Right — editable form */}
          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>Edit information</h2>

            <form onSubmit={submit} className={styles.form}>
              <div className={styles.field}>
                <label htmlFor="name">
                  <User size={14} /> Full name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handle}
                  className="input"
                  placeholder="Your full name"
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="phone">
                  <Phone size={14} /> Phone number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handle}
                  className="input"
                  placeholder="+961 70 123 456"
                />
                <span className={styles.fieldHint}>Optional</span>
              </div>

              <div className={styles.field}>
                <label>
                  <Mail size={14} /> Email address
                </label>
                <input
                  type="email"
                  value={user.email}
                  className="input"
                  disabled
                  style={{ opacity: 0.6, cursor: "not-allowed" }}
                />
                <span className={styles.fieldHint}>Email cannot be changed</span>
              </div>

              {/* Feedback messages */}
              {success && (
                <div className={styles.success}>
                  <CheckCircle size={15} />
                  Profile updated successfully!
                </div>
              )}
              {error && (
                <div className={styles.error}>
                  <AlertCircle size={15} />
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                style={{ alignSelf: "flex-start", padding: "10px 28px" }}
                disabled={loading}
              >
                {loading ? "Saving…" : "Save changes"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
