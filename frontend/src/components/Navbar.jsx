import { Link, useLocation } from "react-router-dom"
import { Heart, LogIn, LogOut, User, Home } from "lucide-react"
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
              {/* Clicking the name goes to profile */}
              <Link to="/profile" className={styles.userNameLink}>
                <User size={15} />
                {user.name}
              </Link>
              <button onClick={logout} className="btn btn-ghost" style={{ padding: "7px 12px" }}>
                <LogOut size={15} /> Sign out
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
