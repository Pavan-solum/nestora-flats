# Nestora — Flats for Sale (Demo)

A responsive, deploy-ready Next.js demo for browsing and managing flats for sale.

## Features

- **Home** with featured listings and marketplace highlights
- **Listings** with search, filters (city, BHK, facing, price, status, furnishing), and sorting
- **Flat detail pages** with photo gallery, bedrooms, facing, amenities, nearby schools / colleges / hospitals / transport
- **Enquiry form** (standalone + on detail/contact pages)
- **Favorites** shortlist (browser storage)
- **Admin portal** to add, edit, delete, and reset flats; review enquiries
- **About** and **Contact** pages
- Mobile-friendly responsive layout

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Admin login (demo)

- Username: `admin`
- Password: `admin123`

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Start local development  |
| `npm run build`| Production build         |
| `npm start`    | Serve production build   |
| `npm run lint` | Run ESLint               |

## Deploy (Vercel)

1. Push this repo to GitHub / GitLab / Bitbucket
2. Import the project in [Vercel](https://vercel.com)
3. Use defaults (Next.js detected automatically)
4. Deploy

Or with Vercel CLI:

```bash
npm i -g vercel
vercel
```

## Data note

Flats, favorites, and enquiries are stored in the browser (`localStorage` / `sessionStorage`) so the demo works without a database. Reset demo data anytime from the admin dashboard.

For a production system, replace the storage helpers in `src/lib/storage.ts` with a real API and database.
