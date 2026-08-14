# 🚗 Veloce Motors — Full-Stack Car Dealership Platform

A complete e-commerce car dealership web app built from scratch — browsing, cart, checkout with real Stripe payments, an accessories store, and a full admin panel.

**[Live Demo](#)** — coming soon

## Features

- 🔐 **Authentication** — secure registration/login with bcrypt-hashed passwords and session management
- 🚙 **Car Inventory** — browse, search, and filter by make/price
- 🛠️ **Accessories Store** — parts and accessories with their own catalog, sharing the same cart
- 🛒 **Cart & Checkout** — add/update/remove items, real-time totals
- 💳 **Real Payments** — Stripe integration (test mode) with a live card form
- 👨‍💼 **Admin Panel** — manage inventory, accessories, and view all orders
- 🎨 **Polished UI** — dark theme, scroll animations, toast notifications, loading states

## Tech Stack

**Frontend:** HTML, CSS, JavaScript (vanilla, no framework)
**Backend:** Node.js, Express
**Database:** MySQL
**Payments:** Stripe API
**Auth:** express-session, bcryptjs

## Project Structure

car-shop/
├── backend/ # Express API server
│ ├── routes/ # Auth, cars, accessories, cart, orders
│ ├── middleware/ # Auth guards (requireAuth, requireAdmin)
│ └── server.js
├── frontend/ # Static HTML/CSS/JS
│ ├── css/
│ └── js/
└── database/
└── schema.sql

## Getting Started

### Prerequisites
- Node.js
- MySQL Server
- A free Stripe account (test mode)

### Setup

1. Clone this repo
2. Run `database/schema.sql` in MySQL to create the database
3. In `backend/`, copy `.env.example` to `.env` and fill in your MySQL credentials and Stripe test keys
4. In `backend/`: `npm install` then `node server.js`
5. Open `frontend/index.html` with a local server (e.g., VS Code Live Server)

## What I Learned Building This

This project was built end-to-end as a hands-on learning exercise — database design, REST API architecture, authentication, payment integration, and frontend UI/UX, all from scratch.

---

Built as a personal learning project.