# ExVeg

ExVeg is an agricultural marketplace and vendor platform for buying fresh produce, managing orders, and supporting seller/admin workflows. The project is split into a React frontend and an Express backend, with separate responsibilities for UI, authentication, and order email notifications.

## Project structure

- `frontend/` — Vite + React application for the storefront, buyer flows, seller onboarding, and admin dashboards
- `backend/` — Express API for checkout and notification handling
- `generate_pages.mjs` — helper script used during project generation / page scaffolding
- `ExVeg PRD.pdf` — product requirements document for the application

## Features

- Product browsing and detail pages
- Cart and checkout flow
- Seller registration and onboarding flow
- Admin dashboard for product approval, verification, and order management
- Buyer, seller, and admin route protection
- Email notifications for order placement
- Analytics and notifications pages

## Tech stack

- Frontend: React, Vite, React Router, Redux Toolkit, Tailwind CSS
- Backend: Node.js, Express
- Auth / platform services: Firebase
- Notification / commerce integrations: SMTP, Cloudinary, Razorpay

## Prerequisites

- Node.js 18+
- npm

## Installation

From the repository root, install dependencies for each app separately:

```bash
cd frontend && npm install
cd ../backend && npm install
```

## Environment variables

The backend expects SMTP configuration values for sending order emails. Create a `.env` file in `backend/` with values similar to:

```env
PORT=5000
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
SMTP_FROM=your-email@example.com
SELLER_EMAIL=seller@exveg.com
ADMIN_EMAIL=admin@exveg.com
```

You can also set additional values used by other integrations as needed.

The optional product seeding script reads `FIREBASE_API_KEY` from the process environment. Set it before running `node seed-products.mjs`; do not commit real `.env` files or place credentials in source code.

Firebase web configuration values used by the frontend are client-side identifiers, not private credentials. Protect Firebase data with appropriate Firestore Security Rules and API-key restrictions.

## Running the app

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend:

```bash
cd frontend
npm run dev
```

The frontend is typically available at `http://localhost:5173` and the backend at `http://localhost:5000`.

## Production build

To build the frontend for deployment:

```bash
cd frontend
npm run build
```

## Scripts

Frontend:

- `npm run dev` — run the Vite development server
- `npm run build` — create a production build
- `npm run preview` — preview the built app
- `npm run lint` — run ESLint checks

Backend:

- `npm run dev` — run the API with nodemon
- `npm start` — run the API in production mode
- `npm test` — run backend tests

## Notes

This repository is structured as a monorepo-like project where the frontend and backend are developed independently but work together as part of the same application. If you are onboarding to the project, start with the frontend route definitions and the backend checkout API to understand the core flows.
