import { createContext, useContext, useEffect, useState } from "react"
import { api } from "../api"

const ListingsContext = createContext(null)

function normalizeListing(listing) {
  return {
    id: listing.id,
    title: listing.title,
    type: listing.type,
    price: listing.price,
    location: listing.location,
    distance: listing.distance,
    beds: listing.beds,
    baths: listing.baths,
    sqm: listing.sqm,
    available: listing.available,
    amenities:
      typeof listing.amenities === "string"
        ? listing.amenities.split(",").map((item) => item.trim()).filter(Boolean)
        : listing.amenities || [],
    description: listing.description,
    rating: listing.rating,
    reviews: listing.reviews,
    color: listing.color,
    landlord: {
      name: listing.landlord_name,
      email: listing.landlord_email,
      phone: listing.landlord_phone,
    },
    submittedBy: listing.landlord_name,
    status: listing.status,
    adminReason: listing.admin_reason || "",
    lastAdminAction: listing.last_admin_action || "",
    photos: listing.photos
      ? listing.photos
          .split(",")
          .filter(Boolean)
          .map((file) => `http://127.0.0.1:8000/uploads/${file}`)
      : [],
    datePosted: listing.date_posted || "",
    inquiries: listing.inquiries ?? 0,
    isAvailable: listing.is_available !== false,
  }
}

function buildWhatsAppLink(phone, message) {
  const cleanPhone = phone.replace(/[^\d]/g, "")
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
}

export function ListingsProvider({ children }) {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadListings = async () => {
    try {
      setLoading(true)
      setError("")
      const data = await api.getListings()
      setListings(data.map(normalizeListing))
    } catch (err) {
      console.error(err)
      setError("Could not load listings. Make sure the backend is running.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadListings()
  }, [])

  const approveListing = async (id) => {
    const current = listings.find((item) => item.id === id)

    if (!current) return

    if (current.status === "approved") {
      alert("This listing is already approved.")
      return
    }

    const updated = await api.approveListing(id)
    const normalized = normalizeListing(updated)

    setListings((prev) => prev.map((item) => (item.id === id ? normalized : item)))

    const message = `Hello ${normalized.landlord.name}, your listing "${normalized.title}" has been approved and is now active on LU Student Housing.`
    window.open(buildWhatsAppLink(normalized.landlord.phone, message), "_blank")
  }

  const rejectListing = async (id, reason) => {
    const current = listings.find((item) => item.id === id)

    if (!current) return

    if (current.status === "rejected") {
      alert("This listing is already rejected.")
      return
    }

    const updated = await api.rejectListing(id, reason)
    const normalized = normalizeListing(updated)

    setListings((prev) => prev.map((item) => (item.id === id ? normalized : item)))

    const message = `Hello ${normalized.landlord.name}, your listing "${normalized.title}" was rejected for this reason: ${reason}`
    window.open(buildWhatsAppLink(normalized.landlord.phone, message), "_blank")
  }

  const removeListing = async (id, reason) => {
    const listing = listings.find((item) => item.id === id)

    if (!listing) return

    const confirmed = window.confirm("Are you sure you want to remove this listing?")
    if (!confirmed) return

    await api.removeListing(id, reason)

    setListings((prev) => prev.filter((item) => item.id !== id))

    const message = `Hello ${listing.landlord.name}, your listing "${listing.title}" was removed from LU Student Housing for this reason: ${reason}`
    window.open(buildWhatsAppLink(listing.landlord.phone, message), "_blank")
  }

  const addListing = async (formData) => {
    const created = await api.createListing(formData)
    const normalized = normalizeListing(created)
    setListings((prev) => [...prev, normalized])
    return normalized
  }

  const updateListing = async (id, formData) => {
    const updated = await api.updateListing(id, formData)
    const normalized = normalizeListing(updated)
    setListings((prev) => prev.map((item) => (item.id === id ? normalized : item)))
    return normalized
  }

  const toggleAvailability = async (id) => {
    const updated = await api.toggleAvailability(id)
    const normalized = normalizeListing(updated)
    setListings((prev) => prev.map((item) => (item.id === id ? normalized : item)))
    return normalized
  }

  const deleteLandlordListing = async (id) => {
    const confirmed = window.confirm("Are you sure? This cannot be undone.")
    if (!confirmed) return false

    const updated = await api.softDeleteListing(id)
    const normalized = normalizeListing(updated)
    setListings((prev) => prev.map((item) => (item.id === id ? normalized : item)))
    return true
  }

  const approvedListings = listings.filter(
    (listing) => listing.status === "approved" && listing.isAvailable
  )
  const pendingListings = listings.filter((listing) => listing.status === "pending")
  const rejectedListings = listings.filter((listing) => listing.status === "rejected")

  return (
    <ListingsContext.Provider
      value={{
        listings,
        loading,
        error,
        approvedListings,
        pendingListings,
        rejectedListings,
        addListing,
        updateListing,
        toggleAvailability,
        deleteLandlordListing,
        approveListing,
        rejectListing,
        removeListing,
        reloadListings: loadListings,
      }}
    >
      {children}
    </ListingsContext.Provider>
  )
}

export const useListings = () => useContext(ListingsContext)