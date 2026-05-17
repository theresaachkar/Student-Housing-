import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, CheckCircle, PlusCircle, Upload, X } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { useListings } from "../context/ListingsContext"
import styles from "./CreateListing.module.css"

const TYPE_OPTIONS = ["Shared", "Studio", "Dorm", "House Share"]

const AMENITY_OPTIONS = [
  "WiFi", "Furnished", "Shared Kitchen", "Private Bathroom",
  "Laundry", "Generator", "Parking", "Elevator", "Balcony", "Water Included",
]

const EMPTY_FORM = {
  title: "",
  type: "Shared",
  location: "",
  price: "",
  beds: "",
  available: "",
  baths: "1",
  sqm: "",
  distance: "",
  description: "",
  phone: "",
}

export default function CreateListing() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { addListing } = useListings()

  const [form, setForm] = useState(EMPTY_FORM)
  const [amenities, setAmenities] = useState([])
  const [photos, setPhotos] = useState([])
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

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

  const handlePhotos = (e) => {
    const files = Array.from(e.target.files)
    setPhotos((prev) => [...prev, ...files].slice(0, 5))
    e.target.value = ""
  }

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
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
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

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
      formData.append("landlord_name", user.name)
      formData.append("landlord_email", user.email)
      formData.append("landlord_phone", form.phone.trim())
      photos.forEach((photo) => formData.append("photos", photo))

      await addListing(formData)
      setSuccess(true)
    } catch (err) {
      setErrors({ submit: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setSuccess(false)
    setForm(EMPTY_FORM)
    setAmenities([])
    setPhotos([])
    setErrors({})
  }

  if (success) {
    return (
      <div className={styles.page}>
        <div className={styles.successCard}>
          <CheckCircle size={52} color="#16a34a" />
          <h2>Listing Submitted!</h2>
          <p>
            Your listing has been sent for admin review and is now marked as
            <strong> Pending Approval</strong>. You will be contacted once it
            goes live.
          </p>
          <div className={styles.successActions}>
            <button className="btn btn-primary" onClick={() => navigate("/browse")}>
              Browse Listings
            </button>
            <button className="btn btn-ghost" onClick={resetForm}>
              Submit Another
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.back} onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className={styles.title}>List Your Property</h1>
          <p className={styles.subtitle}>
            Fill in the details below. Your listing will be reviewed by an admin before going live.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>

          {/* Section 1 — Property Details */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Property Details</h2>

            <div className={styles.grid2}>
              <div className={styles.field}>
                <label>Title *</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handle}
                  className={`input ${errors.title ? styles.inputError : ""}`}
                  placeholder="e.g. Private Studio near AUB"
                />
                {errors.title && <span className={styles.error}>{errors.title}</span>}
              </div>

              <div className={styles.field}>
                <label>Property Type *</label>
                <select name="type" value={form.type} onChange={handle} className="input">
                  {TYPE_OPTIONS.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.field}>
              <label>Location *</label>
              <input
                name="location"
                value={form.location}
                onChange={handle}
                className={`input ${errors.location ? styles.inputError : ""}`}
                placeholder="e.g. Hamra, Beirut"
              />
              {errors.location && <span className={styles.error}>{errors.location}</span>}
            </div>

            <div className={styles.grid3}>
              <div className={styles.field}>
                <label>Price per Month (USD) *</label>
                <input
                  name="price"
                  type="number"
                  min="1"
                  value={form.price}
                  onChange={handle}
                  className={`input ${errors.price ? styles.inputError : ""}`}
                  placeholder="350"
                />
                {errors.price && <span className={styles.error}>{errors.price}</span>}
              </div>

              <div className={styles.field}>
                <label>Number of Rooms *</label>
                <input
                  name="beds"
                  type="number"
                  min="1"
                  value={form.beds}
                  onChange={handle}
                  className={`input ${errors.beds ? styles.inputError : ""}`}
                  placeholder="1"
                />
                {errors.beds && <span className={styles.error}>{errors.beds}</span>}
              </div>

              <div className={styles.field}>
                <label>Available From *</label>
                <input
                  name="available"
                  type="date"
                  value={form.available}
                  onChange={handle}
                  className={`input ${errors.available ? styles.inputError : ""}`}
                />
                {errors.available && <span className={styles.error}>{errors.available}</span>}
              </div>
            </div>
          </section>

          {/* Section 2 — Additional Details */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              Additional Details <span className={styles.optional}>(optional)</span>
            </h2>

            <div className={styles.grid3}>
              <div className={styles.field}>
                <label>Bathrooms</label>
                <input
                  name="baths"
                  type="number"
                  min="1"
                  value={form.baths}
                  onChange={handle}
                  className="input"
                />
              </div>

              <div className={styles.field}>
                <label>Size (sqm)</label>
                <input
                  name="sqm"
                  type="number"
                  min="0"
                  value={form.sqm}
                  onChange={handle}
                  className="input"
                  placeholder="25"
                />
              </div>

              <div className={styles.field}>
                <label>Distance to Campus</label>
                <input
                  name="distance"
                  value={form.distance}
                  onChange={handle}
                  className="input"
                  placeholder="e.g. 5 min walk from AUB"
                />
              </div>
            </div>

            <div className={styles.field}>
              <label>Amenities</label>
              <div className={styles.amenitiesGrid}>
                {AMENITY_OPTIONS.map((amenity) => (
                  <button
                    key={amenity}
                    type="button"
                    className={`${styles.amenityChip} ${amenities.includes(amenity) ? styles.amenityActive : ""}`}
                    onClick={() => toggleAmenity(amenity)}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Section 3 — Description */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Description</h2>
            <div className={styles.field}>
              <label>Describe your property *</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handle}
                className={`input ${styles.textarea} ${errors.description ? styles.inputError : ""}`}
                placeholder="Describe the property, surroundings, house rules, and anything students should know..."
                rows={4}
              />
              {errors.description && <span className={styles.error}>{errors.description}</span>}
            </div>
          </section>

          {/* Section 4 — Contact */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Contact Information</h2>
            <div className={styles.grid3}>
              <div className={styles.field}>
                <label>Your Name</label>
                <input
                  value={user?.name || ""}
                  className="input"
                  readOnly
                  style={{ background: "#f9fafb", color: "var(--color-text-muted)" }}
                />
              </div>

              <div className={styles.field}>
                <label>Your Email</label>
                <input
                  value={user?.email || ""}
                  className="input"
                  readOnly
                  style={{ background: "#f9fafb", color: "var(--color-text-muted)" }}
                />
              </div>

              <div className={styles.field}>
                <label>WhatsApp Phone *</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handle}
                  className={`input ${errors.phone ? styles.inputError : ""}`}
                  placeholder="+961 70 123 456"
                />
                {errors.phone && <span className={styles.error}>{errors.phone}</span>}
              </div>
            </div>
          </section>

          {/* Section 5 — Photos */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              Photos <span className={styles.optional}>(optional — up to 5)</span>
            </h2>

            {photos.length < 5 && (
              <label className={styles.uploadArea}>
                <Upload size={24} />
                <span>Click to upload photos</span>
                <span className={styles.uploadHint}>JPG, PNG, WebP accepted</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotos}
                  style={{ display: "none" }}
                />
              </label>
            )}

            {photos.length > 0 && (
              <div className={styles.photoGrid}>
                {photos.map((photo, index) => (
                  <div key={index} className={styles.photoItem}>
                    <img src={URL.createObjectURL(photo)} alt={`Photo ${index + 1}`} />
                    <button
                      type="button"
                      className={styles.removePhoto}
                      onClick={() => removePhoto(index)}
                      aria-label="Remove photo"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {errors.submit && (
            <div className={styles.submitError}>{errors.submit}</div>
          )}

          <div className={styles.submitRow}>
            <p className={styles.pendingNote}>
              Your listing will be pending admin approval before students can see it.
            </p>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ padding: "12px 32px" }}
            >
              <PlusCircle size={18} />
              {submitting ? "Submitting..." : "Submit Listing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
