import { Link } from "react-router-dom"
import { Heart, MapPin, Bed, Bath, Star } from "lucide-react"
import { useFavorites } from "../context/FavoritesContext"
import styles from "./ListingCard.module.css"

export default function ListingCard({ listing }) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const fav = isFavorite(listing.id)

  return (
    <div className={`card ${styles.card}`}>
      {/* Color banner / image placeholder */}
      <div className={styles.banner} style={{ background: listing.color }}>
        <span className={`badge ${styles.typeBadge}`}>{listing.type}</span>
        <button
          className={`${styles.favBtn} ${fav ? styles.active : ""}`}
          onClick={(e) => { e.preventDefault(); toggleFavorite(listing.id) }}
          aria-label={fav ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart size={16} fill={fav ? "currentColor" : "none"} />
        </button>
        <span className={styles.price}>
          <strong>${listing.price}</strong>/mo
        </span>
      </div>

      {/* Card body */}
      <div className={styles.body}>
        <h3 className={styles.title}>{listing.title}</h3>

        <p className={styles.location}>
          <MapPin size={13} />
          {listing.location} · {listing.distance}
        </p>

        <div className={styles.stats}>
          <span><Bed size={13} /> {listing.beds} bed</span>
          <span><Bath size={13} /> {listing.baths} bath</span>
          <span>{listing.sqm} m²</span>
        </div>

        <div className={styles.amenities}>
          {listing.amenities.slice(0, 3).map((a) => (
            <span key={a} className={styles.tag}>{a}</span>
          ))}
          {listing.amenities.length > 3 && (
            <span className={styles.tag}>+{listing.amenities.length - 3}</span>
          )}
        </div>

        <div className={styles.footer}>
          <span className={styles.rating}>
            <Star size={13} fill="#d97706" color="#d97706" />
            {listing.rating} ({listing.reviews})
          </span>
          <Link to={`/listing/${listing.id}`} className="btn btn-primary" style={{ padding: "8px 16px", fontSize: "13px" }}>
            View Details
          </Link>
        </div>
      </div>
    </div>
  )
}
