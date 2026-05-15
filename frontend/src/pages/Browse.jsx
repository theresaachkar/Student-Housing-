import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Search, SlidersHorizontal, X } from "lucide-react"
import ListingCard from "../components/ListingCard"
import { LISTING_TYPES, LOCATIONS } from "../data/mockListings"
import { useListings } from "../context/ListingsContext"
import styles from "./Browse.module.css"

export default function Browse() {
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get("q") || "")
  const [priceMax, setPriceMax] = useState(600)
  const [type, setType] = useState("All")
  const [location, setLocation] = useState("All Locations")
  const [showFilters, setShowFilters] = useState(false)
  const { approvedListings } = useListings()

  const filtered = approvedListings.filter((l) => {
    const matchSearch =
      search === "" ||
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.location.toLowerCase().includes(search.toLowerCase())
    const matchPrice = l.price <= priceMax
    const matchType = type === "All" || l.type === type
    const matchLoc = location === "All Locations" || l.location === location
    return matchSearch && matchPrice && matchType && matchLoc
  })

  const resetFilters = () => {
    setSearch("")
    setPriceMax(600)
    setType("All")
    setLocation("All Locations")
  }

  return (
    <div className={styles.page}>
      <div className="page-container">
        <div className={styles.header}>
          <div>
            <h1 className="section-title">Browse Listings</h1>
            <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>
              {filtered.length} listing{filtered.length !== 1 ? "s" : ""} found
            </p>
          </div>
          <button
            className={`btn btn-ghost ${styles.filterToggle}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal size={16} />
            Filters
          </button>
        </div>

        {/* Search bar */}
        <div className={styles.searchRow}>
          <div className={styles.searchBox}>
            <Search size={16} color="#9ca3af" />
            <input
              type="text"
              placeholder="Search by name or location…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ color: "#9ca3af" }}>
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className={styles.layout}>
          {/* Filters sidebar */}
          <aside className={`${styles.sidebar} ${showFilters ? styles.open : ""}`}>
            <div className={styles.sidebarHeader}>
              <h2>Filters</h2>
              <button onClick={resetFilters} style={{ fontSize: "13px", color: "var(--color-accent)", fontWeight: 600 }}>
                Reset all
              </button>
            </div>

            {/* Price */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Max price: <strong>${priceMax}/mo</strong></label>
              <input
                type="range"
                min="100"
                max="600"
                step="10"
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className={styles.range}
              />
              <div className={styles.rangeLabels}>
                <span>$100</span>
                <span>$600</span>
              </div>
            </div>

            {/* Type */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Type</label>
              <div className={styles.typeButtons}>
                {LISTING_TYPES.map((t) => (
                  <button
                    key={t}
                    className={`${styles.typeBtn} ${type === t ? styles.active : ""}`}
                    onClick={() => setType(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Location</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="input"
                style={{ fontSize: "13px" }}
              >
                {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
          </aside>

          {/* Listing grid */}
          <div className={styles.main}>
            {filtered.length > 0 ? (
              <div className={styles.grid}>
                {filtered.map((l) => <ListingCard key={l.id} listing={l} />)}
              </div>
            ) : (
              <div className={styles.empty}>
                <Search size={40} color="#d1d5db" />
                <p>No listings match your filters.</p>
                <button className="btn btn-outline" onClick={resetFilters}>Clear filters</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
