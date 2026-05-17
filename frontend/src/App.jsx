import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import { FavoritesProvider } from "./context/FavoritesContext"
import { ListingsProvider } from "./context/ListingsContext"

import Navbar from "./components/Navbar"
import Footer from "./components/Footer"

import Home from "./pages/Home"
import Browse from "./pages/Browse"
import ListingDetail from "./pages/ListingDetail"
import Favorites from "./pages/Favorites"
import Auth from "./pages/Auth"
import Profile from "./pages/Profile"

import Admin from "./pages/Admin"
import AdminListingDetails from "./pages/AdminListingDetails"

import CreateListing from "./pages/CreateListing"
import MyListings from "./pages/MyListings"
import EditListing from "./pages/EditListing"

function ProtectedAdminRoute({ children }) {
  const { user } = useAuth()

  if (!user) return <Navigate to="/auth" replace />
  if (user.role !== "admin") return <Navigate to="/" replace />

  return children
}

function ProtectedLandlordRoute({ children }) {
  const { user } = useAuth()

  if (!user) return <Navigate to="/auth" replace />
  if (user.role !== "landlord") return <Navigate to="/" replace />

  return children
}

export default function App() {
  return (
    <AuthProvider>
      <ListingsProvider>
        <FavoritesProvider>
          <BrowserRouter>
            <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
              <Navbar />

              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/browse" element={<Browse />} />
                <Route path="/listing/:id" element={<ListingDetail />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/profile" element={<Profile />} />

                <Route
                  path="/admin"
                  element={
                    <ProtectedAdminRoute>
                      <Admin />
                    </ProtectedAdminRoute>
                  }
                />

                <Route
                  path="/admin/listings/:id"
                  element={
                    <ProtectedAdminRoute>
                      <AdminListingDetails />
                    </ProtectedAdminRoute>
                  }
                />

                <Route
                  path="/create-listing"
                  element={
                    <ProtectedLandlordRoute>
                      <CreateListing />
                    </ProtectedLandlordRoute>
                  }
                />

                <Route
                  path="/my-listings"
                  element={
                    <ProtectedLandlordRoute>
                      <MyListings />
                    </ProtectedLandlordRoute>
                  }
                />

                <Route
                  path="/edit-listing/:id"
                  element={
                    <ProtectedLandlordRoute>
                      <EditListing />
                    </ProtectedLandlordRoute>
                  }
                />
              </Routes>

              <Footer />
            </div>
          </BrowserRouter>
        </FavoritesProvider>
      </ListingsProvider>
    </AuthProvider>
  )
}