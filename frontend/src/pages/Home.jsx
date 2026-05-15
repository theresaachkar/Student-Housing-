import { Link, useNavigate } from "react-router-dom"
import {
  Home as HomeIcon,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Users,
} from "lucide-react"
import ListingCard from "../components/ListingCard"
import { useListings } from "../context/ListingsContext"
import styles from "./Home.module.css"

export default function Home() {
  const navigate = useNavigate()
  const { approvedListings, loading } = useListings()

  const featuredListings = approvedListings.slice(0, 3)

  const handleSearch = (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const location = formData.get("location")?.trim()

    if (location) {
      navigate(`/browse?search=${encodeURIComponent(location)}`)
    } else {
      navigate("/browse")
    }
  }

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroPattern}></div>

        <div className={styles.heroContent}>
          <p className={styles.heroEyebrow}>Student Housing Platform</p>

          <h1 className={styles.heroTitle}>
            Find your next <em>student home</em> near campus.
          </h1>

          <p className={styles.heroSub}>
            Browse verified housing listings, compare prices, save favorites,
            and contact landlords directly through WhatsApp.
          </p>

          <form className={styles.searchBox} onSubmit={handleSearch}>
            <div className={styles.searchInput}>
              <Search size={18} color="#6b7280" />
              <input
                name="location"
                type="text"
                placeholder="Search by city or area..."
              />
            </div>

            <button className="btn btn-primary" type="submit">
              Search
            </button>
          </form>

          <div className={styles.stats}>
            <span>
              <strong>{approvedListings.length}</strong> approved listings
            </span>
            <span>•</span>
            <span>Verified by admin</span>
          </div>
        </div>
      </section>

      <section className={styles.features}>
        <div className="page-container">
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <HomeIcon size={24} />
              </div>
              <h3>Verified Listings</h3>
              <p>Only approved housing listings appear on the platform.</p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <MapPin size={24} />
              </div>
              <h3>Near Campus</h3>
              <p>Search by area and find housing close to your university.</p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <SlidersHorizontal size={24} />
              </div>
              <h3>Easy Filtering</h3>
              <p>Filter by price, location, room type, and housing details.</p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <Users size={24} />
              </div>
              <h3>Direct Contact</h3>
              <p>Contact landlords quickly through WhatsApp.</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.listings}>
        <div className="page-container">
          <div className={styles.listingsHeader}>
            <div>
              <h2 className="section-title">Featured Listings</h2>
              <p style={{ color: "var(--color-text-muted)", fontSize: 15 }}>
                Explore some approved housing options available for students.
              </p>
            </div>

            <Link to="/browse" className="btn btn-outline">
              View All
            </Link>
          </div>

          {loading ? (
            <p>Loading listings...</p>
          ) : featuredListings.length > 0 ? (
            <div className={styles.grid}>
              {featuredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className={styles.featureCard}>
              <ShieldCheck size={28} />
              <h3>No approved listings yet</h3>
              <p>Listings will appear here after admin approval.</p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}