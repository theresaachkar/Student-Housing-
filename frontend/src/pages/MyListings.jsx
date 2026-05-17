import { useMemo } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Building2, CalendarDays, Eye, EyeOff, MessageCircle, Pencil, PlusCircle, Trash2 } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { useListings } from "../context/ListingsContext"
import styles from "./MyListings.module.css"

const STATUS_LABEL = {
  pending: "Pending",
  approved: "Active",
  rejected: "Rejected",
  deleted: "Deleted",
}

function formatDate(dateStr) {
  if (!dateStr) return "—"
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
}

export default function MyListings() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { listings, loading, toggleAvailability, deleteLandlordListing } = useListings()

  const myListings = useMemo(() => {
    return listings
      .filter((l) => l.landlord.email === user?.email && l.status !== "deleted")
      .sort((a, b) => {
        if (!a.datePosted && !b.datePosted) return 0
        if (!a.datePosted) return 1
        if (!b.datePosted) return -1
        return new Date(b.datePosted) - new Date(a.datePosted)
      })
  }, [listings, user])

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <p style={{ color: "var(--color-text-muted)" }}>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>My Listings</h1>
            <p className={styles.subtitle}>
              {myListings.length} listing{myListings.length !== 1 ? "s" : ""} submitted
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/create-listing")}
            style={{ padding: "10px 20px" }}
          >
            <PlusCircle size={16} />
            New Listing
          </button>
        </div>

        {myListings.length === 0 ? (
          <div className={styles.empty}>
            <Building2 size={48} color="#d1d5db" />
            <h2>No listings yet</h2>
            <p>Submit your first property to start reaching students.</p>
            <Link to="/create-listing" className="btn btn-primary">
              <PlusCircle size={16} /> Create a Listing
            </Link>
          </div>
        ) : (
          <div className={styles.list}>
            {myListings.map((listing) => (
              <div key={listing.id} className={`${styles.card} ${listing.status === "deleted" ? styles.cardDeleted : ""}`}>
                <div className={styles.cardBanner} style={{ background: listing.color }} />

                <div className={styles.cardBody}>
                  <div className={styles.cardTop}>
                    <div className={styles.cardMeta}>
                      <span className={`${styles.statusBadge} ${styles[listing.status]}`}>
                        {STATUS_LABEL[listing.status] ?? listing.status}
                      </span>
                      <span className={styles.type}>{listing.type}</span>
                    </div>
                    <span className={styles.price}>${listing.price}<span>/mo</span></span>
                  </div>

                  <h3 className={styles.cardTitle}>{listing.title}</h3>
                  <p className={styles.location}>{listing.location}</p>

                  <div className={styles.cardStats}>
                    <span>
                      <CalendarDays size={13} />
                      {listing.datePosted ? formatDate(listing.datePosted) : "—"}
                    </span>
                    <span>
                      <MessageCircle size={13} />
                      {listing.inquiries} {listing.inquiries === 1 ? "inquiry" : "inquiries"}
                    </span>
                  </div>

                  {listing.status === "rejected" && listing.adminReason && (
                    <p className={styles.reason}>
                      <strong>Reason:</strong> {listing.adminReason}
                    </p>
                  )}
                </div>

                {listing.status !== "deleted" && (
                  <div className={styles.cardActions}>
                    {listing.status === "approved" && (
                      <Link
                        to={`/listing/${listing.id}`}
                        className="btn btn-outline"
                        style={{ fontSize: "13px", padding: "7px 16px" }}
                      >
                        View Live
                      </Link>
                    )}
                    {listing.status === "approved" && (
                      <button
                        className={listing.isAvailable ? styles.unavailableBtn : styles.availableBtn}
                        onClick={() => toggleAvailability(listing.id)}
                      >
                        {listing.isAvailable
                          ? <><EyeOff size={14} /> Mark Unavailable</>
                          : <><Eye size={14} /> Mark Available</>
                        }
                      </button>
                    )}
                    <Link to={`/edit-listing/${listing.id}`} className={styles.editBtn}>
                      <Pencil size={15} />
                      Edit
                    </Link>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => deleteLandlordListing(listing.id)}
                      title="Delete listing"
                    >
                      <Trash2 size={15} />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
