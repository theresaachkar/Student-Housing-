# LU Student Housing Platform

A web-based platform for university students to find housing and for landlords to list accommodations.

## Team
- Theresa · Celine · Pamela · Agnes

## Tech Stack
- **Frontend:** React + Vite + React Router v6
- **Backend:** ASP.NET Core (C#) _(to be integrated)_
- **Database:** SQLite _(to be integrated)_

## Project Structure

```
src/
├── context/
│   ├── AuthContext.jsx       # User authentication state
│   └── FavoritesContext.jsx  # Saved listings state
├── components/
│   ├── Navbar.jsx            # Top navigation bar
│   └── ListingCard.jsx       # Reusable listing card
│   └── Footer.jsx            # Site footer
├── pages/
│   ├── Home.jsx              # Landing page with hero + featured listings
│   ├── Browse.jsx            # All listings with search + filter sidebar
│   ├── ListingDetail.jsx     # Full listing info + contact modal
│   ├── Favorites.jsx         # Saved listings
│   └── Auth.jsx              # Login / Register
├── data/
│   └── mockListings.js       # Mock data (replace with API calls)
├── App.jsx                   # Router + context providers
├── main.jsx                  # Entry point
└── index.css                 # Global design tokens + utilities
```

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Connecting to the ASP.NET Backend

All API call locations are marked with `// TODO:` comments. Replace the mock data and auth functions with real `fetch()` calls:

| Feature           | File                         | Endpoint (example)         |
|-------------------|------------------------------|----------------------------|
| Login             | `context/AuthContext.jsx`    | `POST /api/auth/login`     |
| Register          | `context/AuthContext.jsx`    | `POST /api/auth/register`  |
| Get listings      | `data/mockListings.js`       | `GET /api/listings`        |
| Get listing by ID | `pages/ListingDetail.jsx`    | `GET /api/listings/:id`    |
| Send message      | `pages/ListingDetail.jsx`    | `POST /api/messages`       |

## Pages & Features

| Page          | Route            | Feature                                      |
|---------------|------------------|----------------------------------------------|
| Home          | `/`              | Hero, search bar, featured listings          |
| Browse        | `/browse`        | All listings, filter by price/type/location  |
| Listing       | `/listing/:id`   | Full details, favourite, contact landlord    |
| Favourites    | `/favorites`     | Saved listings (in-memory, per session)      |
| Auth          | `/auth`          | Login and Register tabs                      |
