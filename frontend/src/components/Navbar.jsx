import { Link, useLocation } from "react-router-dom"
import { Heart, LogIn, LogOut, User, Home, ShieldCheck, PlusCircle, Building2 } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { useFavorites } from "../context/FavoritesContext"
import styles from "./Navbar.module.css"

export default function Navbar() {
  const { user, logout } = useAuth()
  const { favorites } = useFavorites()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          <Home size={20} />
          <span>LU Housing</span>
        </Link>

        <div className={styles.links}>
          <Link to="/" className={`${styles.link} ${isActive("/") ? styles.active : ""}`}>
            Home
          </Link>

          <Link to="/browse" className={`${styles.link} ${isActive("/browse") ? styles.active : ""}`}>
            Browse
          </Link>

          {user?.role === "landlord" && (
            <Link to="/my-listings" className={`${styles.link} ${isActive("/my-listings") ? styles.active : ""}`}>
              <Building2 size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />
              My Listings
            </Link>
          )}

          {user?.role === "landlord" && (
            <Link to="/create-listing" className={`${styles.link} ${isActive("/create-listing") ? styles.active : ""}`}>
              <PlusCircle size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />
              List Property
            </Link>
          )}

          {user?.role === "admin" && (
            <Link to="/admin" className={`${styles.link} ${isActive("/admin") ? styles.active : ""}`}>
              <ShieldCheck size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />
              Admin
            </Link>
          )}
        </div>

        <div className={styles.actions}>
          <Link to="/favorites" className={styles.favBtn}>
            <Heart size={18} />
            {favorites.length > 0 && (
              <span className={styles.badge}>{favorites.length}</span>
            )}
          </Link>

          {user ? (
            <div className={styles.userArea}>
              <span className={styles.userName}>
                <User size={16} /> {user.name} ({user.role})
              </span>

              <button onClick={logout} className="btn btn-ghost" style={{ padding: "8px 14px" }}>
                <LogOut size={16} /> Sign out
              </button>
            </div>
          ) : (
            <Link to="/auth" className="btn btn-primary" style={{ padding: "8px 16px" }}>
              <LogIn size={16} /> Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}