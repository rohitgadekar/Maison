<div align="center">

# 🏛️ MAISON

### *Premium Archival Fashion & Haute Couture E-Commerce Platform*

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.19-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Payment%20Gateway-0C2340?logo=razorpay&logoColor=white)](https://razorpay.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

<p align="center">
  <strong>An editorial-grade, full-stack archival fashion boutique and administrative suite built with modern web technologies.</strong>
</p>

[Explore Features](#-key-features) • [Screenshots](#-screenshots) • [Tech Stack](#-technology-stack) • [Quick Start](#-quick-start) • [Environment Variables](#-environment-variables) • [Database Architecture](#-database--backend-architecture)

---

</div>

## 📖 Overview

**MAISON** is a luxury e-commerce experience tailored for curated archival fashion, haute couture garments, and designer collectibles. Designed with a minimalist, high-contrast editorial aesthetic and buttery-smooth micro-interactions, Maison blends runway art direction with high-performance modern web architecture.

The platform provides a complete end-to-end shopping journey — from interactive sizing and real-time inventory reservation to dual payment protocols (Razorpay & Concierge Pay on Delivery), automated email dispatch, printable luxury invoices, and an enterprise-grade administrative terminal.

---

## 📸 Screenshots

### 1. Homepage & Editorial Showcase
> *Immersive dark aesthetic, featured archival drops, curated category grids, and animated editorial typography.*

<div align="center">
  <img src="https://res.cloudinary.com/ipmbe0zp/image/upload/v1794903741/Screenshot_2026-11-17_at_1.49.31_PM.png" alt="Maison Homepage" width="100%" />
</div>

<br />

### 2. Archival Collections
> *Curated editorial lookbooks, seasonal drop catalogs, and collection filtering.*

<div align="center">
  <img src="https://res.cloudinary.com/ipmbe0zp/image/upload/v1794903741/Screenshot_2026-11-17_at_1.50.05_PM.png" alt="Maison Collections" width="100%" />
</div>

<br />

### 3. Product Archive & Acquisition Terminal
> *Multi-angle gallery view, size selection with real-time stock matrix, size guide chart, and instant cart dispatch.*

<div align="center">
  <img src="https://res.cloudinary.com/ipmbe0zp/image/upload/v1794903740/Screenshot_2026-11-17_at_1.50.52_PM.png" alt="Maison Product Page" width="100%" />
</div>

---

## ✨ Key Features

### 🛍️ Client Experience & Storefront
- **Editorial Archival Aesthetic**: Polished dark theme, typography powered by *Playfair Display* and *Inter*, subtle borders, blur backdrops, and **Lenis** inertia-based smooth scrolling.
- **Dynamic Catalog & Archival Drops**: Filter and browse by collections, garment categories, status tags (`New`, `Archived`, `Sale`), and limited availability badges.
- **Rich Product Detail Pages (PDP)**:
  - Multi-image zoom gallery and thumbnail navigator.
  - Sizing selector with instant out-of-stock disabling.
  - Interactive **Size Chart modal** with switchable Imperial (inches) and Metric (cm) measurements.
  - Dynamic stock status alerts ("Only X pieces remain in the archive").
  - Automated related archival recommendations.
- **Persistent Cart & Wishlist**:
  - Slide-out Cart Drawer with real-time subtotal updates, free shipping progress tracker, and quick item removal.
  - Wishlist system with instant toggle and database sync for authenticated users.
- **Instant Search Overlay**: Modal search bar with instant query debouncing, category tags, price range indicators, and thumbnail previews.
- **Global Multi-Currency Engine**:
  - Live currency switcher supporting **USD ($)**, **EUR (€)**, **GBP (£)**, **INR (₹)**, **CAD (C$)**, **AUD (A$)**, and **JPY (¥)**.
  - Automatic price recalculation and formatted symbol display throughout the catalog.
- **Acquisition Protocol (Checkout)**:
  - Multi-address book (save, edit, delete, and set default shipping destinations).
  - Dynamic coupon / promo code application engine with validation rules and usage limits.
  - Dynamic shipping logistics selection (Standard, Express, Concierge).
  - **Dual Payment Protocols**:
    - **Online Transfer**: Razorpay payment modal supporting Cards, UPI, Netbanking, and Wallets.
    - **Concierge P.O.D**: Pay on Delivery option with instant inventory allocation.
- **Luxury Printable Invoice**: Built-in invoice generator with luxury typography and print portal rendering for orders and receipts.
- **Offline Protocol Detection**: Real-time network watcher displaying an offline status banner with automatic reconnection handling.
- **SEO & Social Metadata**: Integrated OpenGraph and JSON-LD structured schema using `react-helmet-async`.

---

### 🛡️ Administrative Command Suite (`/admin`)
- **Executive Analytics Dashboard**: Overview cards for total revenue, active inventory, pending orders, and concierge POD requests.
- **Products & Inventory Manager**:
  - Full CRUD capabilities for products.
  - Size matrix inventory management (XS, S, M, L, XL, XXL) with per-size stock counts.
  - Image management, pricing, category classification, and custom tags/badges.
- **Collections Orchestration**: Create and manage seasonal editorial collections with custom slugs, descriptions, and hero imagery.
- **Order Fulfillment Pipeline**:
  - Live tracking of order lifecycle (`pending` → `processing` → `shipped` → `delivered` → `cancelled`).
  - Tracking number and carrier assignment with customer notification sync.
  - Customer contact records and invoice inspection.
- **Customer Directory**: View verified profiles, total lifetime acquisitions, order history, and contact details.
- **Shipping Logistics Rules**: Configure logistics providers, base delivery rates, estimated windows, and free shipping thresholds.
- **Coupon & Promotions Engine**: Create fixed-amount or percentage discount codes, configure minimum spend limits, expiration dates, and max redemptions.
- **Payment Verification Logs**: Monitor Razorpay payment IDs, verify webhook payloads, and audit transaction records.
- **System Settings Terminal**: Global switches for maintenance mode, online checkout toggling, Concierge POD toggling, and default store currency configuration.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling & Design System** | [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Radix UI Primitives](https://www.radix-ui.com/) |
| **Icons & Typography** | [Lucide React](https://lucide.dev/), `@fontsource/playfair-display`, `@fontsource/inter` |
| **Smooth Scrolling** | [Lenis](https://github.com/darkroomengineering/lenis) |
| **State & Data Fetching** | [TanStack React Query v5](https://tanstack.com/query/v5), React Context API |
| **Database & Auth** | [Supabase](https://supabase.com/) (PostgreSQL, Row-Level Security, Auth, Storage) |
| **Serverless Functions** | Supabase Edge Functions (Deno / TypeScript runtime) |
| **Payments** | [Razorpay](https://razorpay.com/) Payment Gateway & Webhook verification |
| **Email Notifications** | [Resend](https://resend.com/) API via Supabase Edge Functions |
| **Validation & Forms** | [Zod](https://zod.dev/), [React Hook Form](https://react-hook-form.com/) |
| **Notifications & Modals** | [Sonner](https://sonner.emilkowal.ski/), [Vaul](https://vaul.emilkowal.ski/) |

---

## 📁 Project Structure

```plaintext
Maison/
├── .env.example                    # Template for environment configuration
├── .gitignore                      # Git ignore rules (protects .env and build assets)
├── components.json                 # shadcn/ui configuration
├── index.html                      # HTML entry with Razorpay & typography roots
├── package.json                    # Project dependencies and npm scripts
├── tailwind.config.ts              # Tailwind CSS aesthetic configuration
├── tsconfig.json                   # TypeScript project configuration
├── vite.config.ts                  # Vite build tool configuration
│
├── public/                         # Static assets and favicons
│
├── src/
│   ├── main.tsx                    # Application entry point
│   ├── App.tsx                     # Top-level providers and route definitions
│   ├── index.css                   # Global styles, Tailwind directives, and themes
│   │
│   ├── components/                 # Reusable UI & Layout Components
│   │   ├── admin/                  # Admin layout components
│   │   ├── ui/                     # shadcn/ui Radix primitive wrappers
│   │   ├── Header.tsx              # Top navigation bar with drawer triggers
│   │   ├── Footer.tsx              # Luxury footer with links & newsletter
│   │   ├── Hero.tsx                # Homepage hero banner
│   │   ├── CartDrawer.tsx          # Slide-out shopping bag
│   │   ├── ProductCard.tsx         # Product preview card with quick actions
│   │   ├── Price.tsx               # Currency-aware price display component
│   │   ├── SizeChart.tsx           # Interactive sizing guide
│   │   ├── SearchOverlay.tsx       # Instant search modal
│   │   ├── Invoice.tsx             # Printable invoice template
│   │   ├── SmoothScroll.tsx        # Lenis smooth scroll provider
│   │   └── SEO.tsx                 # Dynamic document metadata & OpenGraph
│   │
│   ├── context/                    # Global React Context Providers
│   │   ├── AuthContext.tsx         # User authentication & role management
│   │   ├── CartContext.tsx         # Shopping bag operations & persistence
│   │   ├── WishlistContext.tsx     # Bookmarked items & sync
│   │   ├── CurrencyContext.tsx     # Multi-currency rates & conversion
│   │   └── SiteSettingsContext.tsx # Global operational flags & toggles
│   │
│   ├── data/                       # Fallback datasets and product types
│   ├── hooks/                      # Custom React utility hooks
│   ├── integrations/
│   │   └── supabase/               # Supabase client instantiation
│   ├── lib/                        # Calculations, notifications, and formatting
│   │
│   └── pages/                      # Application Route Views
│       ├── Index.tsx               # Homepage
│       ├── Shop.tsx                # Catalog & filter directory
│       ├── Product.tsx             # Single product detail view
│       ├── Wishlist.tsx            # Saved items view
│       ├── Checkout.tsx            # Multi-step checkout & payment
│       ├── Orders.tsx              # Customer order history
│       ├── Account.tsx             # User profile and address management
│       ├── Auth.tsx                # Customer sign-in & registration
│       ├── Offline.tsx             # Network offline fallback screen
│       │
│       └── admin/                  # Administrative Terminal Views
│           ├── Dashboard.tsx       # KPI metrics & quick actions
│           ├── Products.tsx        # Product catalog CRUD
│           ├── Orders.tsx          # Order fulfillment & status updates
│           ├── Collections.tsx     # Editorial drop curation
│           ├── Customers.tsx       # User registry & spend insights
│           ├── Shipping.tsx        # Logistics carrier settings
│           ├── Coupons.tsx         # Discount code management
│           ├── Payments.tsx        # Transaction logs & reconciliation
│           └── Settings.tsx        # Store parameters & currency configuration
│
└── supabase/
    ├── functions/                  # Serverless Edge Functions (Deno)
    │   ├── create-razorpay-order/  # Razorpay backend order generation
    │   ├── handle-razorpay-webhook/# Secure payment webhook processing
    │   └── send-order-notification/# Resend order confirmation emails
    └── migrations/                 # PostgreSQL schema migrations
```

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/maison.git
cd maison
```

### 2. Install Dependencies
You can use `npm`, `pnpm`, or `bun`:

```bash
npm install
# or
pnpm install
# or
bun install
```

### 3. Setup Environment Variables
Create a `.env` file in the project root based on `.env.example`:

```bash
cp .env.example .env
```

Populate the required keys in `.env`:
```env
# Supabase Configuration
VITE_SUPABASE_PROJECT_ID="your_supabase_project_id"
VITE_SUPABASE_URL="https://your_project_id.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your_supabase_anon_public_key"

# Razorpay Payment Gateway (Test/Live Public Key)
VITE_RAZORPAY_KEY_ID="rzp_test_your_key_id"
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

---

## 🔐 Environment Variables

The application utilizes client-side environment variables prefixed with `VITE_` alongside Supabase backend edge function secrets:

| Variable | Scope | Required | Description |
| :--- | :--- | :---: | :--- |
| `VITE_SUPABASE_URL` | Frontend | **Yes** | Your Supabase project URL (e.g. `https://xyz.supabase.co`) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Frontend | **Yes** | Your Supabase Anonymous Public API key |
| `VITE_SUPABASE_PROJECT_ID` | Frontend | Optional | Project identifier for Supabase references |
| `VITE_RAZORPAY_KEY_ID` | Frontend | **Yes** | Razorpay Key ID used by the client-side checkout modal |
| `RAZORPAY_KEY_SECRET` | Edge Function | **Yes** | Razorpay Key Secret stored in Supabase Secrets |
| `RAZORPAY_WEBHOOK_SECRET` | Edge Function | Optional | Webhook signature secret for verifying Razorpay callbacks |
| `RESEND_API_KEY` | Edge Function | Optional | Resend API key for automated transaction email dispatches |

> [!IMPORTANT]
> Never commit `.env` or sensitive secret keys to version control. The `.gitignore` has been pre-configured to exclude all `.env` files while preserving `.env.example`.

---

## 🗄️ Database & Backend Architecture

Maison utilizes **Supabase** (PostgreSQL) with Row-Level Security (RLS) policies. Schema definition scripts are included directly in the root directory and the `supabase/` folder:

1. **Products & Inventory (`products_schema.sql`, `product_stocks_schema.sql`)**:
   - Manages product metadata, slugs, tags, pricing, and per-size stock matrix.
   - Includes stored procedures (`deduct_inventory`) to atomically decrement stock during purchases.
2. **Orders & Transactions (`orders_schema.sql`)**:
   - Stores orders, shipping details, payment modes, tracking numbers, and fulfillment status.
   - Associated `order_items` table linking specific size variants and pricing at time of purchase.
3. **Cart & Wishlist (`cart_schema.sql`, `wishlist_schema.sql`)**:
   - Real-time customer cart and saved wishlist artifacts tied to user UUIDs.
4. **Currency Settings (`currency_setup.sql`)**:
   - Configures store base currency and exchange rates across supported international currencies.
5. **Security Policies (`stock_access_policy.sql`)**:
   - Granular RLS policies granting public read access while restricting administrative modifications to verified staff.

---

## 📦 Building for Production

To create an optimized production build:

```bash
npm run build
```

To test the production build locally:

```bash
npm run preview
```

### Deploying to Vercel
The repository includes a pre-configured `vercel.json` with single-page app rewrite rules:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Simply connect your GitHub repository to [Vercel](https://vercel.com/) and specify your environment variables in the project settings.

---

## 📜 Available Scripts

- `npm run dev`: Launch Vite local development server with HMR.
- `npm run build`: Compile and minify production bundles into `/dist`.
- `npm run build:dev`: Build using development mode flags.
- `npm run lint`: Execute ESLint across the codebase.
- `npm run preview`: Locally serve the production `/dist` directory.

---

## 🤝 Contributing

Contributions, feature suggestions, and bug reports are welcome!
1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">
  <p>Crafted with precision for archival fashion connoisseurs.</p>
</div>
