import { createContext, useContext, useEffect, useState } from "react"

const ListingsContext = createContext(null)

const API = "http://localhost:8000"

// Transform backend flat structure → shape the components expect
function transformListing(listing) {
  return {
    ...listing,
    // Parse amenities from "WiFi,Kitchen,Laundry" → ["WiFi", "Kitchen", "Laundry"]
    amenities: typeof listing.amenities === "string"
      ? listing.amenities.split(",").map((a) => a.trim()).filter(Boolean)
      : listing.amenities,
    // Nest landlord fields into an object
    landlord: {
      name: listing.landlord_name,
      email: listing.landlord_email,
      phone: listing.landlord_phone,
    },
    // Map snake_case → camelCase for admin notes
    adminReason: listing.admin_reason || "",
    // submittedBy shown in admin table
    submittedBy: listing.landlord_name,
  }
}

export function ListingsProvider({ children }) {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchListings = () => {
    return fetch(`${API}/api/listings`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch listings")
        return res.json()
      })
      .then((data) => {
        setListings(data.map(transformListing))
      })
      .catch(() => {
        setError("Could not load listings. Make sure the backend is running.")
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchListings()
  }, [])

  // Derived lists
  const approvedListings = listings.filter((l) => l.status === "approved")
  const pendingListings = listings.filter((l) => l.status === "pending")
  const rejectedListings = listings.filter((l) => l.status === "rejected")

  // Admin actions — call API then refresh listings
  const approveListing = async (id) => {
    await fetch(`${API}/api/listings/${id}/approve`, { method: "PATCH" })
    await fetchListings()
  }

  const rejectListing = async (id, reason) => {
    await fetch(`${API}/api/listings/${id}/reject`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    })
    await fetchListings()
  }

  const removeListing = async (id, reason) => {
    await fetch(`${API}/api/listings/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    })
    await fetchListings()
  }

  return (
    <ListingsContext.Provider value={{
      listings,
      loading,
      error,
      approvedListings,
      pendingListings,
      rejectedListings,
      approveListing,
      rejectListing,
      removeListing,
    }}>
      {children}
    </ListingsContext.Provider>
  )
}

export const useListings = () => useContext(ListingsContext)
