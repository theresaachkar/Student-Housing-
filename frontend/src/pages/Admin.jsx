import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import {
  CheckCircle,
  Clock,
  Eye,
  Home,
  RotateCcw,
  ShieldCheck,
  Trash2,
  Users,
  XCircle,
} from "lucide-react"
import { api } from "../api"
import { useListings } from "../context/ListingsContext"
import styles from "./Admin.module.css"

export default function Admin() {
  const {
    listings,
    loading,
    pendingListings,
    approvedListings,
    rejectedListings,
    approveListing,
    rejectListing,
    removeListing,
  } = useListings()

  const [users, setUsers] = useState([])

  const loadUsers = async () => {
    const data = await api.getUsers()
    setUsers(data)
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const deactivateUser = async (id) => {
    await api.deactivateUser(id)
    await loadUsers()
  }

  const reactivateUser = async (id) => {
    await api.reactivateUser(id)
    await loadUsers()
  }

  const handleReject = async (listing) => {
    const reason = window.prompt("Enter rejection reason:")

    if (!reason || !reason.trim()) {
      alert("Rejection reason is required.")
      return
    }

    await rejectListing(listing.id, reason.trim())
  }

  const handleRemove = async (listing) => {
    const reason = window.prompt("Enter removal reason:")

    if (!reason || !reason.trim()) {
      alert("Removal reason is required.")
      return
    }

    await removeListing(listing.id, reason.trim())
  }

  if (loading) {
    return (
      <main className={styles.page}>
        <div className="page-container">
          <h1 className="section-title">Loading admin panel...</h1>
        </div>
      </main>
    )
  }

  return (
    <main className={styles.page}>
      <div className="page-container">
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Admin Panel</p>
            <h1 className="section-title">Platform Management</h1>
            <p className={styles.subtitle}>
              Review listings, manage users, and control platform safety.
            </p>
          </div>
        </div>

        <section className={styles.statsGrid}>
          <div className={styles.statCard}>
            <Home size={22} />
            <div>
              <strong>{listings.length}</strong>
              <span>Total Listings</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <CheckCircle size={22} />
            <div>
              <strong>{approvedListings.length}</strong>
              <span>Approved</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <Clock size={22} />
            <div>
              <strong>{pendingListings.length}</strong>
              <span>Pending</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <XCircle size={22} />
            <div>
              <strong>{rejectedListings.length}</strong>
              <span>Rejected</span>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>Listing Approval</h2>
              <p>View details, approve, reject, or remove submitted listings.</p>
            </div>
          </div>

          <div className={styles.tableCard}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Listing</th>
                  <th>Landlord</th>
                  <th>Location</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Admin Note</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {listings.map((listing) => (
                  <tr key={listing.id}>
                    <td>
                      <strong>{listing.title}</strong>
                      <span>{listing.type}</span>
                    </td>

                    <td>{listing.submittedBy}</td>
                    <td>{listing.location}</td>
                    <td>${listing.price}/mo</td>

                    <td>
                      <span className={`${styles.status} ${styles[listing.status]}`}>
                        {listing.status}
                      </span>
                    </td>

                    <td className={styles.noteCell}>
                      {listing.adminReason || "No note yet"}
                    </td>

                    <td>
                      <div className={styles.actions}>
                        <Link
                          to={`/admin/listings/${listing.id}`}
                          className={styles.viewBtn}
                        >
                          <Eye size={15} />
                          View
                        </Link>

                        <button
                          className={styles.approveBtn}
                          onClick={() => approveListing(listing.id)}
                        >
                          <CheckCircle size={15} />
                          Approve
                        </button>

                        <button
                          className={styles.rejectBtn}
                          onClick={() => handleReject(listing)}
                        >
                          <XCircle size={15} />
                          Reject
                        </button>

                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleRemove(listing)}
                        >
                          <Trash2 size={15} />
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {listings.length === 0 && (
                  <tr>
                    <td colSpan="7" className={styles.empty}>
                      No listings found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>User Management</h2>
              <p>Deactivate or reactivate registered accounts.</p>
            </div>
          </div>

          <div className={styles.userGrid}>
            {users.map((user) => (
              <div key={user.id} className={styles.userCard}>
                <div className={styles.avatar}>{user.name.charAt(0)}</div>

                <div className={styles.userInfo}>
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>

                  <small>
                    <ShieldCheck size={13} />
                    {user.role}
                  </small>

                  <small className={styles.joinDate}>
                    Joined: {user.join_date}
                  </small>

                  <span className={`${styles.userStatus} ${styles[user.status]}`}>
                    {user.status}
                  </span>
                </div>

                {user.role !== "admin" &&
                  (user.status === "active" ? (
                    <button
                      className={styles.deactivateBtn}
                      onClick={() => deactivateUser(user.id)}
                    >
                      Deactivate
                    </button>
                  ) : (
                    <button
                      className={styles.reactivateBtn}
                      onClick={() => reactivateUser(user.id)}
                    >
                      <RotateCcw size={14} />
                      Reactivate
                    </button>
                  ))}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}