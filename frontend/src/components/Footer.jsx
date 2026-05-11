import { Home } from "lucide-react"
import styles from "./Footer.module.css"

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Home size={16} />
          <span>LU Student Housing</span>
        </div>
        <p className={styles.text}>
          Built by Theresa, Celine, Pamela & Agnes · LU Computer Science Project
        </p>
        <p className={styles.text}>© 2025 LU Housing Platform. For students, by students.</p>
      </div>
    </footer>
  )
}
