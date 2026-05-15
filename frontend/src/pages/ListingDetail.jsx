import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Bath,
  BedDouble,
  CheckCircle,
  Heart,
  Mail,
  MapPin,
  Phone,
  Ruler,
  Star,
  X,
} from "lucide-react"
import { useListings } from "../context/ListingsContext"
import { useFavorites } from "../context/FavoritesContext"
import styles from "./ListingDetail.module.css"

export default function ListingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { approvedListings, loading } = useListings()
  const { isFavorite, toggleFavorite } = useFavorites()
  const [contactOpen, setContactOpen] = useState(false)
  const [sent, setSent] = useState(false)

  const listing = approvedListings.find((item) => item.id === Number(id))

  if (loading) {
    return (
      <main className={styles.page}>
        <div className="page-container">
          <h1 className="section-title">Loading listing...</h1>
        </div>
      </main>
    )
  }

  if (!listing) {
    return (
      <main className={styles.page}>
        <div className="page-container">
          <h1 className="section-title">Listing not found</h1>
          <Link to="/browse" className="btn btn-primary">
            Back to Browse
          </Link>
        </div>
      </main>
    )
  }

  const whatsappMessage = `Hello ${listing.landlord.name}, I am interested in your listing "${listing.title}" on LU Student Housing.`
  const whatsappLink = `https://wa.me/${listing.landlord.phone.replace(
    /[^\d]/g,
    ""
  )}?text=${encodeURIComponent(whatsappMessage)}`

  const handleSendMessage = () => {
    setSent(true)
    window.open(whatsappLink, "_blank")
  }

  return (
    <main className={styles.page}>
      <div className="page-container">
        <button className={styles.back} onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
          Back
        </button>

        <div className={styles.layout}>
          <section className={styles.main}>
            <div
              className={styles.banner}
              style={{ background: listing.color }}
            >
              <div className={styles.bannerContent}>
                <span className={`badge ${styles.typeBadge}`}>
                  {listing.type}
                </span>
                <h1 className={styles.title}>{listing.title}</h1>
                <p className={styles.locationLine}>
                  <MapPin size={16} />
                  {listing.location} · {listing.distance}
                </p>
              </div>
            </div>

            <div className={styles.body}>
              <div className={styles.statsRow}>
                <span>
                  <BedDouble size={17} />
                  {listing.beds} bed
                </span>
                <span>
                  <Bath size={17} />
                  {listing.baths} bath
                </span>
                <span>
                  <Ruler size={17} />
                  {listing.sqm} sqm
                </span>
                <span>
                  <Star size={17} />
                  {listing.rating} ({listing.reviews} reviews)
                </span>
              </div>

              <section className={styles.section}>
                <h2>Description</h2>
                <p>{listing.description}</p>
              </section>

              <section className={styles.section}>
                <h2>Amenities</h2>
                <div className={styles.amenityGrid}>
                  {listing.amenities.map((amenity) => (
                    <span key={amenity} className={styles.amenity}>
                      <CheckCircle size={15} />
                      {amenity}
                    </span>
                  ))}
                </div>
              </section>

              <section className={styles.section}>
                <h2>Availability</h2>
                <p>This listing is available from {listing.available}.</p>
              </section>
            </div>
          </section>

          <aside className={styles.sidebar}>
            <div className={`card ${styles.priceCard}`}>
              <div className={styles.price}>
                <strong>${listing.price}</strong>
                <span>/month</span>
              </div>

              <button
                className={`btn btn-primary ${styles.contactBtn}`}
                onClick={() => setContactOpen(true)}
              >
                <Phone size={17} />
                Contact Landlord
              </button>

              <button
                className={`btn btn-outline ${styles.favBtn} ${
                  isFavorite(listing.id) ? styles.favActive : ""
                }`}
                onClick={() => toggleFavorite(listing.id)}
              >
                <Heart size={17} />
                {isFavorite(listing.id) ? "Saved" : "Save Listing"}
              </button>
            </div>

            <div className={`card ${styles.landlordCard}`}>
              <h3>Landlord</h3>

              <div className={styles.landlordAvatar}>
                {listing.landlord.name.charAt(0)}
              </div>

              <p className={styles.landlordName}>{listing.landlord.name}</p>

              <div className={styles.landlordContact}>
                <a href={`mailto:${listing.landlord.email}`}>
                  <Mail size={15} />
                  {listing.landlord.email}
                </a>

                <a href={whatsappLink} target="_blank" rel="noreferrer">
                  <Phone size={15} />
                  WhatsApp
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {contactOpen && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Contact Landlord</h2>
              <button onClick={() => setContactOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {sent ? (
              <div className={styles.success}>
                <CheckCircle size={42} />
                <p>WhatsApp opened with your message.</p>
              </div>
            ) : (
              <>
                <p style={{ marginBottom: 14, color: "var(--color-text-muted)" }}>
                  You will be redirected to WhatsApp to contact{" "}
                  <strong>{listing.landlord.name}</strong>.
                </p>

                <textarea
                  className={`input ${styles.textarea}`}
                  defaultValue={whatsappMessage}
                  readOnly
                />

                <button
                  className="btn btn-primary"
                  style={{ width: "100%", justifyContent: "center", marginTop: 16 }}
                  onClick={handleSendMessage}
                >
                  Send via WhatsApp
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  )
}