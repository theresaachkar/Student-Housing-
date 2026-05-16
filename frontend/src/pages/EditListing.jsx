import { useState, useEffect, useMemo } from "react"
import { Navigate, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, CheckCircle, Save, Upload, X } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { useListings } from "../context/ListingsContext"
import styles from "./CreateListing.module.css"

const TYPE_OPTIONS = ["Shared", "Studio", "Dorm", "House Share"]

const AMENITY_OPTIONS = [
  "WiFi", "Furnished", "Shared Kitchen", "Private Bathroom",
  "Laundry", "Generator", "Parking", "Elevator", "Balcony", "Water Included",
]

export default function EditListing() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useAuth()
  const { listings, loading, updateListing } = useListings()

  const listing = useMemo(
    () => listings.find((l) => l.id === Number(id)),
    [listings, id]
  )

  const [form, setForm] = useState({
    title: "", type: "Shared", location: "", price: "",
    beds: "", available: "", baths: "1", sqm: "", distance: "",
    description: "", phone: "",
  })
  const [amenities, setAmenities] = useState([])
  const [existingPhotos, setExistingPhotos] = useState([])
  const [newPhotos, setNewPhotos] = useState([])
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [savedListing, setSavedListing] = useState(null)

  useEffect(() => {
    if (!listing) return
    setForm({
      title: listing.title,
      type: listing.type,
      location: listing.location,
      price: String(listing.price),
      beds: String(listing.beds),
      available: listing.available || "",
      baths: String(listing.baths || 1),
      sqm: String(listing.sqm || ""),
      distance: listing.distance || "",
      description: listing.description,
      phone: listing.landlord.phone || "",
    })
    setAmenities(Array.isArray(listing.amenities) ? listing.amenities : [])
    setExistingPhotos(listing.photos || [])
  }, [listing?.id])

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <p style={{ color: "var(--color-text-muted)" }}>Loading...</p>
        </div>
      </div>
    )
  }

  if (!listing || listing.landlord.email !== user?.email) {
    return <Navigate to="/my-listings" replace />
  }

  const totalPhotos = existingPhotos.length + newPhotos.length

  const handle = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }))
  }

  const toggleAmenity = (amenity) => {
    setAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    )
  }

  const handleNewPhotos = (e) => {
    const files = Array.from(e.target.files)
    setNewPhotos((prev) => {
      const remaining = 5 - existingPhotos.length - prev.length
      return [...prev, ...files.slice(0, remaining)]
    })
    e.target.value = ""
  }

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = "Title is required"
    if (!form.location.trim()) e.location = "Location is required"
    if (!form.description.trim()) e.description = "Description is required"
    if (!form.price || Number(form.price) <= 0) e.price = "Enter a valid price"
    if (!form.beds || Number(form.beds) < 1) e.beds = "Enter at least 1 room"
    if (!form.available) e.available = "Available date is required"
    if (!form.phone.trim()) e.phone = "Phone number is required"
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setSubmitting(true)
    setErrors({})

    try {
      const formData = new FormData()
      formData.append("title", form.title.trim())
      formData.append("type", form.type)
      formData.append("location", form.location.trim())
      formData.append("price", form.price)
      formData.append("beds", form.beds)
      formData.append("available", form.available)
      formData.append("baths", form.baths || 1)
      formData.append("sqm", form.sqm || 0)
      formData.append("distance", form.distance.trim())
      formData.append("amenities", amenities.join(","))
      formData.append("description", form.description.trim())
      formData.append("landlord_phone", form.phone.trim())

      const keepFilenames = existingPhotos
        .map((url) => url.split("/uploads/")[1])
        .filter(Boolean)
        .join(",")
      formData.append("existing_photos", keepFilenames)
      newPhotos.forEach((photo) => formData.append("new_photos", photo))

      const result = await updateListing(Number(id), formData)
      setSavedListing(result)
    } catch (err) {
      setErrors({ submit: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  if (savedListing) {
    const wentToPending =
      listing.status === "approved" && savedListing.status === "pending"
    return (
      <div className={styles.page}>
        <div className={styles.successCard}>
          <CheckCircle size={52} color="#16a34a" />
          <h2>Changes Saved!</h2>
          {wentToPending ? (
            <p>
              Your listing was updated. Because the price changed, it has returned to{" "}
              <strong>Pending Approval</strong> for admin review.
            </p>
          ) : (
            <p>Your listing has been updated and changes are live immediately.</p>
          )}
          <div className={styles.successActions}>
            <button className="btn btn-primary" onClick={() => navigate("/my-listings")}>
              My Listings
            </button>
            {savedListing.status === "approved" && (
              <button className="btn btn-ghost" onClick={() => navigate(`/listing/${savedListing.id}`)}>
                View Live
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.back} onClick={() => navigate("/my-listings")}>
            <ArrowLeft size={16} /> My Listings
          </button>
          <h1 className={styles.title}>Edit Listing</h1>
          <p className={styles.subtitle}>
            Update your property details. Changing the price on an approved listing will require re-approval.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>

          {/* Property Details */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Property Details</h2>

            <div className={styles.grid2}>
              <div className={styles.field}>
                <label>Title *</label>
                <input name="title" value={form.title} onChange={handle}
                  className={`input ${errors.title ? styles.inputError : ""}`}
                  placeholder="e.g. Private Studio near AUB" />
                {errors.title && <span className={styles.error}>{errors.title}</span>}
              </div>

              <div className={styles.field}>
                <label>Property Type *</label>
                <select name="type" value={form.type} onChange={handle} className="input">
                  {TYPE_OPTIONS.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className={styles.field}>
              <label>Location *</label>
              <input name="location" value={form.location} onChange={handle}
                className={`input ${errors.location ? styles.inputError : ""}`}
                placeholder="e.g. Hamra, Beirut" />
              {errors.location && <span className={styles.error}>{errors.location}</span>}
            </div>

            <div className={styles.grid3}>
              <div className={styles.field}>
                <label>Price per Month (USD) *</label>
                <input name="price" type="number" min="1" value={form.price} onChange={handle}
                  className={`input ${errors.price ? styles.inputError : ""}`} placeholder="350" />
                {errors.price && <span className={styles.error}>{errors.price}</span>}
                {listing.status === "approved" && (
                  <span style={{ fontSize: "11px", color: "#d97706" }}>
                    Changing price will require re-approval
                  </span>
                )}
              </div>

              <div className={styles.field}>
                <label>Number of Rooms *</label>
                <input name="beds" type="number" min="1" value={form.beds} onChange={handle}
                  className={`input ${errors.beds ? styles.inputError : ""}`} placeholder="1" />
                {errors.beds && <span className={styles.error}>{errors.beds}</span>}
              </div>

              <div className={styles.field}>
                <label>Available From *</label>
                <input name="available" type="date" value={form.available} onChange={handle}
                  className={`input ${errors.available ? styles.inputError : ""}`} />
                {errors.available && <span className={styles.error}>{errors.available}</span>}
              </div>
            </div>
          </section>

          {/* Additional Details */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              Additional Details <span className={styles.optional}>(optional)</span>
            </h2>

            <div className={styles.grid3}>
              <div className={styles.field}>
                <label>Bathrooms</label>
                <input name="baths" type="number" min="1" value={form.baths} onChange={handle} className="input" />
              </div>
              <div className={styles.field}>
                <label>Size (sqm)</label>
                <input name="sqm" type="number" min="0" value={form.sqm} onChange={handle} className="input" placeholder="25" />
              </div>
              <div className={styles.field}>
                <label>Distance to Campus</label>
                <input name="distance" value={form.distance} onChange={handle} className="input"
                  placeholder="e.g. 5 min walk from AUB" />
              </div>
            </div>

            <div className={styles.field}>
              <label>Amenities</label>
              <div className={styles.amenitiesGrid}>
                {AMENITY_OPTIONS.map((amenity) => (
                  <button key={amenity} type="button"
                    className={`${styles.amenityChip} ${amenities.includes(amenity) ? styles.amenityActive : ""}`}
                    onClick={() => toggleAmenity(amenity)}>
                    {amenity}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Description */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Description</h2>
            <div className={styles.field}>
              <label>Describe your property *</label>
              <textarea name="description" value={form.description} onChange={handle} rows={4}
                className={`input ${styles.textarea} ${errors.description ? styles.inputError : ""}`}
                placeholder="Describe the property, surroundings, house rules..." />
              {errors.description && <span className={styles.error}>{errors.description}</span>}
            </div>
          </section>

          {/* Contact */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Contact Information</h2>
            <div className={styles.grid3}>
              <div className={styles.field}>
                <label>Your Name</label>
                <input value={user?.name || ""} className="input" readOnly
                  style={{ background: "#f9fafb", color: "var(--color-text-muted)" }} />
              </div>
              <div className={styles.field}>
                <label>Your Email</label>
                <input value={user?.email || ""} className="input" readOnly
                  style={{ background: "#f9fafb", color: "var(--color-text-muted)" }} />
              </div>
              <div className={styles.field}>
                <label>WhatsApp Phone *</label>
                <input name="phone" value={form.phone} onChange={handle}
                  className={`input ${errors.phone ? styles.inputError : ""}`}
                  placeholder="+961 70 123 456" />
                {errors.phone && <span className={styles.error}>{errors.phone}</span>}
              </div>
            </div>
          </section>

          {/* Photos */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              Photos <span className={styles.optional}>(up to 5)</span>
            </h2>

            {totalPhotos > 0 && (
              <div className={styles.photoGrid}>
                {existingPhotos.map((url) => (
                  <div key={url} className={styles.photoItem}>
                    <img src={url} alt="Listing photo" />
                    <button type="button" className={styles.removePhoto}
                      onClick={() => setExistingPhotos((prev) => prev.filter((p) => p !== url))}
                      aria-label="Remove photo">
                      <X size={13} />
                    </button>
                  </div>
                ))}
                {newPhotos.map((photo, index) => (
                  <div key={`new-${index}`} className={styles.photoItem}>
                    <img src={URL.createObjectURL(photo)} alt={`New photo ${index + 1}`} />
                    <button type="button" className={styles.removePhoto}
                      onClick={() => setNewPhotos((prev) => prev.filter((_, i) => i !== index))}
                      aria-label="Remove photo">
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {totalPhotos < 5 && (
              <label className={styles.uploadArea}>
                <Upload size={24} />
                <span>{totalPhotos > 0 ? "Add more photos" : "Click to upload photos"}</span>
                <span className={styles.uploadHint}>{totalPhotos}/5 — JPG, PNG, WebP accepted</span>
                <input type="file" accept="image/*" multiple onChange={handleNewPhotos}
                  style={{ display: "none" }} />
              </label>
            )}
          </section>

          {errors.submit && <div className={styles.submitError}>{errors.submit}</div>}

          <div className={styles.submitRow}>
            <p className={styles.pendingNote}>
              {listing.status === "approved"
                ? "Non-price changes go live immediately."
                : "Changes will be saved to your listing."}
            </p>
            <button type="submit" className="btn btn-primary" disabled={submitting}
              style={{ padding: "12px 32px" }}>
              <Save size={18} />
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
