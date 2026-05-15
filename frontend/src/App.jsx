import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
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

export default function App() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <ListingsProvider>
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
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/listings/:id" element={<AdminListingDetails />} />
              </Routes>
              <Footer />
            </div>
          </BrowserRouter>
        </ListingsProvider>
      </FavoritesProvider>
    </AuthProvider>
  )
}
