import { Link, useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Bath,
  BedDouble,
  CheckCircle,
  Mail,
  MapPin,
  Phone,
  Ruler,
  Trash2,
  XCircle,
} from "lucide-react"
import { useListings } from "../context/ListingsContext"
import styles from "./AdminListingDetails.module.css"

export default function AdminListingDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { listings, approveListing, rejectListing, removeListing } = useListings()

  const listing = listings.find((item) => item.id === Number(id))

  if (!listing) {
    return (
      <main className={styles.page}>
        <div className="page-container">
          <h1 className="section-title">Listing not found</h1>
          <Link to="/admin" className="btn btn-primary">
            Back to Admin Panel
          </Link>
        </div>
      </main>
    )
  }

  const handleApprove = async () => {
    await approveListing(listing.id)
  }

  const handleReject = async () => {
    const reason = window.prompt("Enter rejection reason:")

    if (!reason || !reason.trim()) {
      alert("Rejection reason is required.")
      return
    }

    await rejectListing(listing.id, reason.trim())
  }

  const handleRemove = async () => {
    const reason = window.prompt("Enter removal reason:")

    if (!reason || !reason.trim()) {
      alert("Removal reason is required.")
      return
    }

    await removeListing(listing.id, reason.trim())
    navigate("/admin")
  }

  return (
    <main className={styles.page}>
      <div className="page-container">
        <Link to="/admin" className={styles.back}>
          <ArrowLeft size={16} />
          Back to Admin Panel
        </Link>

        <section className={styles.hero} style={{ background: listing.color }}>
          <div>
            <span className={styles.status}>{listing.status}</span>
            <h1>{listing.title}</h1>
            <p>
              <MapPin size={16} />
              {listing.location} — {listing.distance}
            </p>
          </div>
        </section>

        <section className={styles.layout}>
          <div className={styles.main}>
            <div className={styles.card}>
              <h2>Listing Information</h2>

              <div className={styles.infoGrid}>
                <div>
                  <strong>Type</strong>
                  <span>{listing.type}</span>
                </div>
                <div>
                  <strong>Price</strong>
                  <span>${listing.price}/month</span>
                </div>
                <div>
                  <strong>Available</strong>
                  <span>{listing.available}</span>
                </div>
                <div>
                  <strong>Status</strong>
                  <span>{listing.status}</span>
                </div>
              </div>

              <div className={styles.stats}>
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
              </div>

              <h2>Description</h2>
              <p>{listing.description}</p>

              <h2>Amenities</h2>
              <div className={styles.amenities}>
                {listing.amenities.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>

              {listing.adminReason && (
                <>
                  <h2>Last Admin Note</h2>
                  <p className={styles.reason}>{listing.adminReason}</p>
                </>
              )}
            </div>
          </div>

          <aside className={styles.sidebar}>
            <div className={styles.card}>
              <h2>Landlord</h2>

              <div className={styles.avatar}>
                {listing.landlord.name.charAt(0)}
              </div>

              <strong>{listing.landlord.name}</strong>

              <a href={`mailto:${listing.landlord.email}`}>
                <Mail size={15} />
                {listing.landlord.email}
              </a>

              <a
                href={`https://wa.me/${listing.landlord.phone.replace(/[^\d]/g, "")}`}
                target="_blank"
                rel="noreferrer"
              >
                <Phone size={15} />
                WhatsApp landlord
              </a>
            </div>

            <div className={styles.card}>
              <h2>Admin Actions</h2>

              <button
                className={`${styles.actionBtn} ${styles.approve}`}
                onClick={handleApprove}
              >
                <CheckCircle size={17} />
                Approve Listing
              </button>

              <button
                className={`${styles.actionBtn} ${styles.reject}`}
                onClick={handleReject}
              >
                <XCircle size={17} />
                Reject with Reason
              </button>

              <button
                className={`${styles.actionBtn} ${styles.delete}`}
                onClick={handleRemove}
              >
                <Trash2 size={17} />
                Remove with Reason
              </button>
            </div>
          </aside>
        </section>
      </div>
    </main>
  )
}