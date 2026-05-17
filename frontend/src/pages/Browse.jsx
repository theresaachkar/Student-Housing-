import { useState, useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import { Search, SlidersHorizontal, X } from "lucide-react"
import ListingCard from "../components/ListingCard"
import { useListings } from "../context/ListingsContext"
import styles from "./Browse.module.css"

const LISTING_TYPES = ["All", "Studio", "Shared", "1BR Flat", "Dorm", "House Share", "En-suite"]
const ROOMS_OPTIONS = ["Any", "1", "2", "3", "3+"]

export default function Browse() {
  const [searchParams] = useSearchParams()
  const { approvedListings } = useListings()

  const [search, setSearch] = useState(searchParams.get("search") || searchParams.get("q") || "")
  const [priceMin, setPriceMin] = useState("")
  const [priceMax, setPriceMax] = useState("")
  const [type, setType] = useState("All")
  const [rooms, setRooms] = useState("Any")
  const [location, setLocation] = useState("All Locations")
  const [showFilters, setShowFilters] = useState(false)

  // Derive unique locations from real backend data
  const locations = useMemo(() => {
    const unique = [...new Set(approvedListings.map((l) => l.location))]
    return ["All Locations", ...unique.sort()]
  }, [approvedListings])

  const filtered = approvedListings.filter((l) => {
    const matchSearch =
      search === "" ||
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.location.toLowerCase().includes(search.toLowerCase())

    const matchPriceMin = priceMin === "" || l.price >= Number(priceMin)
    const matchPriceMax = priceMax === "" || l.price <= Number(priceMax)

    const matchType = type === "All" || l.type === type

    const matchRooms =
      rooms === "Any" ||
      (rooms === "3+" ? l.beds >= 3 : l.beds === Number(rooms))

    const matchLoc = location === "All Locations" || l.location === location

    return matchSearch && matchPriceMin && matchPriceMax && matchType && matchRooms && matchLoc
  })

  const resetFilters = () => {
    setSearch("")
    setPriceMin("")
    setPriceMax("")
    setType("All")
    setRooms("Any")
    setLocation("All Locations")
  }

  const hasActiveFilters =
    search || priceMin || priceMax || type !== "All" || rooms !== "Any" || location !== "All Locations"

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
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  style={{ fontSize: "13px", color: "var(--color-accent)", fontWeight: 600 }}
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Price range — min + max */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Price range ($/mo)</label>
              <div className={styles.priceInputs}>
                <div className={styles.priceField}>
                  <span>Min</span>
                  <input
                    type="number"
                    className="input"
                    placeholder="0"
                    min="0"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    style={{ fontSize: "13px" }}
                  />
                </div>
                <span className={styles.priceSep}>—</span>
                <div className={styles.priceField}>
                  <span>Max</span>
                  <input
                    type="number"
                    className="input"
                    placeholder="Any"
                    min="0"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    style={{ fontSize: "13px" }}
                  />
                </div>
              </div>
            </div>

            {/* Number of rooms */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Number of rooms</label>
              <div className={styles.typeButtons}>
                {ROOMS_OPTIONS.map((r) => (
                  <button
                    key={r}
                    className={`${styles.typeBtn} ${rooms === r ? styles.active : ""}`}
                    onClick={() => setRooms(r)}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Listing type */}
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

            {/* Location — derived from real data */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Location</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="input"
                style={{ fontSize: "13px" }}
              >
                {locations.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </div>
          </aside>

          {/* Listing grid */}
          <div className={styles.main}>
            {filtered.length > 0 ? (
              <div className={styles.grid}>
                {filtered.map((l) => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
            ) : (
              <div className={styles.empty}>
                <Search size={40} color="#d1d5db" />
                <p>No listings match your filters.</p>
                <button className="btn btn-outline" onClick={resetFilters}>
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
