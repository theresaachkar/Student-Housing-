import { useNavigate } from "react-router-dom"
import { Heart } from "lucide-react"
import ListingCard from "../components/ListingCard"
import { useListings } from "../context/ListingsContext"
import { useFavorites } from "../context/FavoritesContext"
import styles from "./Favorites.module.css"

export default function Favorites() {
  const navigate = useNavigate()
  const { favorites } = useFavorites()
  const { approvedListings } = useListings()
  const favListings = approvedListings.filter((l) => favorites.includes(l.id))

  return (
    <div className={styles.page}>
      <div className="page-container">
        <div className={styles.header}>
          <div>
            <h1 className="section-title">My Favourites</h1>
            <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>
              {favListings.length} saved listing{favListings.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {favListings.length > 0 ? (
          <div className={styles.grid}>
            {favListings.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        ) : (
          <div className={styles.empty}>
            <Heart size={48} color="#d1d5db" />
            <h2>No favourites yet</h2>
            <p>Save listings you like by clicking the heart icon on any listing card.</p>
            <button className="btn btn-primary" onClick={() => navigate("/browse")}>
              Browse Listings
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
