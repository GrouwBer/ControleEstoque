# Product Requirements Document
# Projeto Loja v3.0 — Inventory & POS for Antique Shops

**Document Version:** 1.0  
**Date:** June 2026  
**Status:** Draft for Review  
**Classification:** Internal  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Market Analysis](#2-market-analysis)
3. [Product Vision](#3-product-vision)
4. [User Personas](#4-user-personas)
5. [Functional Requirements](#5-functional-requirements)
6. [Technical Architecture](#6-technical-architecture)
7. [Database Schema](#7-database-schema)
8. [UI/UX Standards](#8-uiux-standards)
9. [Design System](#9-design-system)
10. [Accessibility & Compliance](#10-accessibility--compliance)
11. [Expertise Requirements](#11-expertise-requirements)
12. [Implementation Roadmap](#12-implementation-roadmap)
13. [Success Metrics](#13-success-metrics)
14. [Appendices](#14-appendices)

---

## 1. Executive Summary

### 1.1 Problem Statement

Antique and collectible shops operate in a **$58 billion global market** yet are severely underserved by modern software. Existing inventory tools (Sortly, Airtable) lack point-of-sale capabilities. Existing POS systems (Square, Shopify) assume standardized SKUs and cannot handle one-of-a-kind items with rich provenance metadata. The niche antique-specific tools (GoAntiquing, AAIN) use interfaces from the early 2000s with no cloud, mobile, or API access.

**The result:** shop owners juggle spreadsheets, paper tags, and disconnected tools, losing time on administration instead of selling.

### 1.2 Proposed Solution

**Projeto Loja** is a vertical SaaS application combining:
- **Photo-first visual inventory** (Sortly-grade, optimized for unique items)
- **Simple modern POS** (Square-grade checkout flow, zero training needed)
- **Supabase backend** (PostgreSQL, Auth, Storage, realtime — zero DevOps)
- **Premium UX** (WCAG 2.2 AA, 17px base font for older users, Portuguese-first)

### 1.3 Target Market

| Segment | Size | Growth |
|---|---|---|
| Global antiques market | $58.4B (2024) | 6.7% CAGR |
| US collectibles market | $84.3B (2024) | 5.3% CAGR |
| Small business inventory software | $1.45B (2025) | 12.5% CAGR |
| Brazilian antique dealers | ~15,000 shops | — |

### 1.4 Business Model

**Freemium SaaS:**
- **Free tier:** 100 products, 1 user, core inventory + basic POS
- **Pro tier:** $15–30/mo — unlimited products, photos, reports, multi-user
- **Supabase free tier** covers hosting for early customers (500MB DB, 1GB storage)

---

## 2. Market Analysis

### 2.1 Market Overview

The global inventory management software market was valued at **$3.6–3.9 billion in 2024** and is projected to reach $7.1–8.0 billion by 2032–2034, growing at **6.4–9.5% CAGR** (Grand View Research, GM Insights, Mordor Intelligence). The small business segment specifically is estimated at **$1.45 billion in 2025**, reaching $3.2 billion by 2032 (~12.5% CAGR).

The antiques and collectibles vertical is substantial:
- Global antiques market: **$58.4B (2024)**, growing at ~6.7% CAGR
- Broader collectibles: **$321B (2025)**, projected $467B by 2032 (5.5% CAGR)
- US collectibles: **$84.3B (2024)** — individual collectors represent 78.8% of the market
- Online antiques & collectibles sales in the US: **$2.7B (2024)**

The antiques market is reportedly experiencing a boom in 2025 (~15% annual growth), fueled by younger buyers entering the space.

### 2.2 Competitive Landscape

#### 2.2.1 Commercial SaaS Tools

| Tool | Starting Price | Strengths | Weaknesses | Fit for Antiques |
|---|---|---|---|---|
| **Sortly** | Free (100 items) → $49/mo | Best-in-class photo inventory, mobile-first, offline | No POS/payments, no consignment | ⭐⭐⭐⭐⭐ (inventory only) |
| **Square for Retail** | Free → $49/mo | Full POS, free tier, excellent payments | SKU-based, no photo-first approach, no consignment | ⭐⭐⭐ (POS only) |
| **Shopify POS** | $39/mo + $89/mo Pro | Omnichannel, huge ecosystem | Expensive, standardized products, no photo inventory | ⭐⭐ |
| **Lightspeed** | $89–$339/mo | Powerful inventory, serial numbers, reporting | Overbuilt for 1–2 person shops, expensive, steep learning | ⭐⭐ |
| **KORONA POS** | $59/mo | No transaction fees, antique-specific marketing, modern UI | Hardware costs, no photo-first, no consignment | ⭐⭐⭐ |
| **Zoho Inventory** | Free → $39/mo | Multi-channel (eBay, Etsy, Amazon), affordable | Weak POS, no photo-first, tables-heavy | ⭐⭐ |
| **Airtable** | Free → $20/user/mo | Maximum flexibility, gallery view for photos, automations | Not a POS, no payments, per-user pricing | ⭐⭐⭐⭐ (inventory only) |
| **Erply** | $29–39/mo | Affordable, supplier/PO management, offline | Dated UX, weak mobile, limited US presence | ⭐⭐ |

#### 2.2.2 Open-Source / Self-Hosted

| Tool | Pricing | Strengths | Weaknesses | Fit |
|---|---|---|---|---|
| **Homebox** | Free (MIT) | QR code labels, photo catalog, Docker | No POS, home-focused, no commerce features | ⭐⭐⭐ |
| **Snipe-IT** | Free (AGPLv3) | Asset lifecycle, check-in/out, labels | IT-centric, no POS, dated UI | ⭐ |
| **InvenTree** | Free (MIT) | Purchase/sales orders, barcode, API | Manufacturing-focused, no POS checkout | ⭐⭐ |

#### 2.2.3 Niche Antique-Specific

| Tool | Pricing | Strengths | Weaknesses |
|---|---|---|---|
| **GoAntiquing! POS** | Quote-based | Multi-vendor, consignment, per-dealer reports | Dated UI, Windows-only, no mobile |
| **AAIN FastTrack POS** | $519.95 one-time | Built for antiques, consignment, wish lists | Desktop-only (Windows), no cloud, no API |

### 2.3 Gap Analysis — The Opportunity

**The core gap:** No existing tool combines (a) photo-first visual inventory for unique items, (b) a simple modern POS, (c) optional consignment tracking, and (d) QR-code shelf labels — at a price accessible to a single-owner antique shop.

The market bifurcates into "beautiful inventory without POS" (Sortly, Airtable) and "competent POS without visual inventory" (Square, Lightspeed). Building a tool at the intersection of these categories at **$15–30/mo** creates a uniquely unserved position.

### 2.4 Vertically-Specific Pain Points

| Pain Point | Existing Solutions | Gap |
|---|---|---|
| One-of-a-kind inventory (no SKUs) | Sortly (inventory only) | No POS integration |
| Rich metadata (provenance, era, materials) | Airtable (no POS) | Complex setup, expensive per-user |
| Negotiable/haggled pricing at POS | KORONA POS | No photo inventory, hardware costs |
| Consignment/multi-dealer payouts | GoAntiquing (dated, no cloud) | No modern alternative exists |
| QR code shelf labels → scan for info | Homebox (no POS) | Home-focused, not commercial |
| Photo-first browsing (visual identification) | Sortly, Airtable Gallery | Neither does payments |
| Insurance/valuation documentation | Homebox, Sortly | Manual export, no valuation templates |
| Owner-operated, low tech literacy | Square (simple) | Wrong product model for antiques |

---

## 3. Product Vision

### 3.1 Elevator Pitch

**Projeto Loja** is the first all-in-one inventory and point-of-sale system designed specifically for antique and collectible shops. It combines Sortly's visual photo-first approach with Square's dead-simple checkout — optimized for unique items, Portuguese-speaking shop owners, and users over 50.

### 3.2 Core Principles

1. **Photo-first, not SKU-first** — The primary identifier for any item is its photograph
2. **Zero training required** — Any shop owner can use it within 5 minutes of opening
3. **Works everywhere** — Cloud-based (Supabase), mobile-responsive, offline-tolerant
4. **Respects the user** — 17px base font, WCAG 2.2 AA, Portuguese-first, no dark patterns
5. **Progressive complexity** — Advanced features (consignment, reports, multi-user) exist but stay hidden until needed

### 3.3 Positioning Statement

> For antique and collectible shop owners who struggle with generic retail software that doesn't understand unique inventory, Projeto Loja is a visual-first inventory and POS system that treats every item as one-of-a-kind, unlike Square or Lightspeed which force standardized product models. Unlike Sortly which stops at inventory, Projeto Loja provides the complete sell-from-inventory workflow at half the price.

---

## 4. User Personas

### 4.1 Primary: Maria — Solo Antique Shop Owner

| Attribute | Detail |
|---|---|
| **Age** | 58 |
| **Tech literacy** | Moderate (uses WhatsApp, Instagram, basic Excel) |
| **Shop** | 80m² antiques shop in São Paulo, ~500 items |
| **Daily workflow** | Opens shop, photographs new arrivals, prices items, sells 3–8 items/day, tracks what sold to whom |
| **Pain points** | Can't find items in her spreadsheet; forgets who reserved what; prices inconsistently |
| **Goals** | Know exactly what's in stock, who reserved what, and how much she made this month |
| **Device** | Samsung Android phone + 5-year-old Windows laptop |

### 4.2 Secondary: Carlos — Multi-Dealer Antique Mall Manager

| Attribute | Detail |
|---|---|
| **Age** | 45 |
| **Tech literacy** | Moderate-High |
| **Mall** | 30 dealers, 3,000+ items, 2 employees |
| **Pain points** | Tracking per-dealer sales and payouts; items move between booths; monthly reconciliation takes days |
| **Goals** | Automated per-dealer reporting; check-in/check-out for dealer items; QR code labels |

### 4.3 Tertiary: Ana — Accountant

| Attribute | Detail |
|---|---|
| **Age** | 35 |
| **Tech literacy** | High |
| **Role** | Visits monthly to reconcile books |
| **Goals** | Export sales reports; see profit margins; export CSV for tax filing |

---

## 5. Functional Requirements

### 5.1 Authentication & Authorization

| ID | Requirement | Priority |
|---|---|---|
| AUTH-01 | Email/password login via Supabase Auth | P0 |
| AUTH-02 | Password reset flow | P1 |
| AUTH-03 | Row Level Security — each shop sees only its own data | P0 |
| AUTH-04 | Session persistence across browser restarts | P1 |
| AUTH-05 | Logout with confirmation | P2 |

### 5.2 Product Catalog

| ID | Requirement | Priority |
|---|---|---|
| CAT-01 | Add product with: photo, name, description, category, condition, cost price, list price, notes | P0 |
| CAT-02 | Auto-generated SKU (format: REL-XXXX) | P0 |
| CAT-03 | Upload product photo to Supabase Storage | P0 |
| CAT-04 | List products with filters: search, category, condition, status | P0 |
| CAT-05 | Instant search with dropdown (250ms debounce) | P0 |
| CAT-06 | Product detail page showing all fields + sale/reservation history | P0 |
| CAT-07 | Edit any product field after creation | P0 |
| CAT-08 | Delete product only if never sold (soft constraint) | P1 |
| CAT-09 | Bulk actions: select multiple, delete, export CSV | P1 |
| CAT-10 | Condition values: Novo, Como Novo, Bom, Regular, Ruim | P0 |

### 5.3 Inventory Statuses

| ID | Requirement | Priority |
|---|---|---|
| STA-01 | Three statuses: Disponível (available), Reservado (reserved), Vendido (sold) | P0 |
| STA-02 | Status badges with color coding: green, amber, red | P0 |
| STA-03 | Auto-status change on sale/reservation/cancellation | P0 |
| STA-04 | Status filter on product list | P1 |

### 5.4 Shopping Cart & Sales

| ID | Requirement | Priority |
|---|---|---|
| CRT-01 | Cart as slide-in drawer (offcanvas), accessible from any page | P0 |
| CRT-02 | All cart operations via AJAX — zero page reloads | P0 |
| CRT-03 | Add/remove products (only available items) | P0 |
| CRT-04 | Optional buyer name and phone | P0 |
| CRT-05 | Discount: percentage (%) or fixed amount (R$) | P0 |
| CRT-06 | Running subtotal, discount, and final total | P0 |
| CRT-07 | Finalize sale → marks items as sold, creates sale record | P0 |
| CRT-08 | Cancel sale → returns items to available stock | P1 |
| CRT-09 | Sale notes field (e.g., "Paid in cash") | P2 |
| CRT-10 | Live cart badge in navbar showing item count | P1 |

### 5.5 Reservations

| ID | Requirement | Priority |
|---|---|---|
| RES-01 | Reserve products via cart (multiple items at once) | P0 |
| RES-02 | Customer name, phone, email on reservation | P0 |
| RES-03 | Optional payment deadline date | P1 |
| RES-04 | Visual deadline alerts: red (overdue), amber (≤3 days) | P1 |
| RES-05 | Convert reservation → sale with adjustable final price | P0 |
| RES-06 | Cancel reservation → product returns to available | P0 |
| RES-07 | Reservation list with status tabs (Active, Converted, Cancelled) | P1 |

### 5.6 Sales History

| ID | Requirement | Priority |
|---|---|---|
| HIS-01 | Chronological list of all finalized sales | P0 |
| HIS-02 | Filter by buyer name, date range | P1 |
| HIS-03 | Sale detail: items sold, prices, discounts, profit | P0 |
| HIS-04 | Cancel sale from detail page | P1 |
| HIS-05 | Export sales as CSV | P2 |

### 5.7 Dashboard

| ID | Requirement | Priority |
|---|---|---|
| DSH-01 | Stat cards: Available, Reserved, Sold (Month), Revenue, Profit, Discounts, Total Items | P0 |
| DSH-02 | Cards are clickable — navigate to filtered product/sales views | P1 |
| DSH-03 | Revenue bar chart (last 30 days) via Chart.js/Recharts | P1 |
| DSH-04 | Activity feed (last 15 events: sales, reservations, new products) | P1 |
| DSH-05 | Count-up animation on stat card values | P2 |
| DSH-06 | Quick action buttons with keyboard shortcut hints | P2 |

### 5.8 UX Enhancements

| ID | Requirement | Priority |
|---|---|---|
| UX-01 | Dark/light theme toggle with system preference detection | P0 |
| UX-02 | Command palette (Ctrl+K) with fuzzy search and keyboard navigation | P1 |
| UX-03 | Global shortcuts: Ctrl+N (new product), Ctrl+Shift+N (quick add) | P2 |
| UX-04 | Toast notifications for all transient feedback | P1 |
| UX-05 | Skeleton loading states for async data | P2 |
| UX-06 | Empty states with icon, message, and CTA | P1 |
| UX-07 | Tooltips on icon-only action buttons | P2 |
| UX-08 | Focus-visible outlines matching accent color | P1 |

### 5.9 Mobile Experience

| ID | Requirement | Priority |
|---|---|---|
| MOB-01 | Fully responsive — works on phones, tablets, and desktop | P0 |
| MOB-02 | Touch targets minimum 44x44 CSS pixels | P0 |
| MOB-03 | Tables collapse to card layout on small screens | P1 |
| MOB-04 | Cart drawer full-width on mobile | P1 |
| MOB-05 | No horizontal scroll at any viewport | P1 |

---

## 6. Technical Architecture

### 6.1 Technology Stack

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                          │
│  Next.js 14 (App Router) + Tailwind CSS + shadcn/ui │
│  Hosted on Vercel (free tier)                       │
├─────────────────────────────────────────────────────┤
│                    BACKEND                           │
│  Supabase (PostgreSQL 15 + Auth + Storage + Realtime)│
│  Row Level Security for multi-tenant data isolation │
│  Free tier: 500MB DB, 1GB storage, 50K monthly users│
├─────────────────────────────────────────────────────┤
│                    INTEGRATIONS                      │
│  Supabase JS client (direct DB access from frontend)│
│  Supabase Auth (email/password)                     │
│  Supabase Storage (product photos)                  │
│  Supabase Realtime (dashboard live updates)         │
└─────────────────────────────────────────────────────┘
```

### 6.2 Data Flow

```
User → Next.js App → Supabase JS Client → PostgreSQL
                           ↓
                    Supabase Auth (JWT)
                           ↓
                    Row Level Security (RLS)
```

**No custom API server.** The Supabase JS client connects directly to PostgreSQL with Row Level Security policies enforcing data isolation. This eliminates an entire layer of backend code and hosting.

### 6.3 Authentication Flow

1. User signs up/logs in with email + password
2. Supabase returns JWT with `sub` claim (user UUID)
3. All subsequent requests include JWT in `Authorization` header
4. RLS policies filter queries: `WHERE user_id = auth.uid()`
5. Session persisted in `localStorage` via Supabase client

### 6.4 File Storage

- Product photos stored in Supabase Storage bucket `product-images`
- Public bucket with RLS policies: users can only upload/delete their own files
- Images served via Supabase CDN with automatic resizing
- Accepted formats: JPEG, PNG, WebP (max 5MB)

---

## 7. Database Schema

### 7.1 Entity-Relationship Diagram

```
auth.users (Supabase managed)
    │
    ├── products (user_id FK)
    │       │
    │       ├── reservations (product_id FK)
    │       └── cart_items (product_id FK)
    │               │
    │               └── carts (cart_id FK) [user_id FK]
    │
    └── [RLS: all tables filtered by user_id]
```

### 7.2 Table Definitions

```sql
-- ═══════════════════════════════════════
-- Products
-- ═══════════════════════════════════════
CREATE TABLE products (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sku           TEXT NOT NULL,
  name          TEXT NOT NULL,
  description   TEXT DEFAULT '',
  category      TEXT DEFAULT '',
  condition     TEXT NOT NULL CHECK (condition IN ('New','Like New','Good','Fair','Poor')),
  cost_price    DECIMAL(12,2) NOT NULL DEFAULT 0,
  list_price    DECIMAL(12,2) NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available','reserved','sold')),
  image_url     TEXT DEFAULT '',
  notes         TEXT DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, sku)
);

-- ═══════════════════════════════════════
-- Carts (sale sessions)
-- ═══════════════════════════════════════
CREATE TABLE carts (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  buyer_name      TEXT DEFAULT '',
  buyer_phone     TEXT DEFAULT '',
  discount_type   TEXT NOT NULL DEFAULT 'none' CHECK (discount_type IN ('none','percent','fixed')),
  discount_value  DECIMAL(12,2) NOT NULL DEFAULT 0,
  subtotal        DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  final_total     DECIMAL(12,2) NOT NULL DEFAULT 0,
  notes           TEXT DEFAULT '',
  sale_notes      TEXT DEFAULT '',
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','finalized','cancelled')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  finalized_at    TIMESTAMPTZ,
  cancelled_at    TIMESTAMPTZ
);

-- ═══════════════════════════════════════
-- Cart Items
-- ═══════════════════════════════════════
CREATE TABLE cart_items (
  id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  cart_id             BIGINT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id          BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  list_price_at_time  DECIMAL(12,2) NOT NULL,
  final_price         DECIMAL(12,2) NOT NULL DEFAULT 0
);

-- ═══════════════════════════════════════
-- Reservations
-- ═══════════════════════════════════════
CREATE TABLE reservations (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id      BIGINT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  customer_name   TEXT NOT NULL,
  customer_phone  TEXT DEFAULT '',
  customer_email  TEXT DEFAULT '',
  reserved_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  deadline        DATE,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','converted','cancelled'))
);

-- ═══════════════════════════════════════
-- Indexes
-- ═══════════════════════════════════════
CREATE INDEX idx_products_user_status ON products(user_id, status);
CREATE INDEX idx_products_user_sku ON products(user_id, sku);
CREATE INDEX idx_products_user_category ON products(user_id, category);
CREATE INDEX idx_carts_user_status ON carts(user_id, status);
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product ON cart_items(product_id);
CREATE INDEX idx_reservations_user_status ON reservations(user_id, status);
CREATE INDEX idx_reservations_product ON reservations(product_id);
```

### 7.3 Row Level Security Policies

```sql
-- Products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own products" ON products
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Carts
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own carts" ON carts
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Cart Items (cascaded through cart ownership)
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own cart items" ON cart_items
  FOR ALL USING (
    cart_id IN (SELECT id FROM carts WHERE user_id = auth.uid())
  );

-- Reservations
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own reservations" ON reservations
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### 7.4 Supabase Storage Policies

```sql
-- Product images bucket
CREATE POLICY "Users upload own images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');
```

---

## 8. UI/UX Standards

### 8.1 Accessibility — WCAG 2.2 Level AA

All interfaces **must** conform to WCAG 2.2 Level AA as defined by the W3C (ISO/IEC 40500:2025). Key requirements:

#### Perceivable
| Criterion | Requirement | Implementation |
|---|---|---|
| 1.4.3 Contrast (Minimum) | 4.5:1 normal text, 3:1 large text | Design tokens enforce this; automated testing via axe-core |
| 1.4.11 Non-Text Contrast | 3:1 for UI components and graphics | Status badges, chart colors, form borders all verified |
| 1.4.13 Content on Hover or Focus | Hover content dismissible without moving pointer | Tooltips close on Escape; hover cards have close button |

#### Operable
| Criterion | Requirement | Implementation |
|---|---|---|
| 2.4.7 Focus Visible | Visible focus indicator on all interactive elements | `:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }` |
| 2.4.11 Focus Not Obscured (NEW 2.2) | Focused element not hidden by sticky/fixed content | Sticky headers have `scroll-padding-top`; modals trap focus |
| 2.5.8 Target Size Minimum (NEW 2.2) | 24×24 CSS pixels minimum | All buttons, inputs, selects meet this; mobile = 44×44px |
| 2.1.1 Keyboard | All functionality via keyboard only | Full keyboard navigation spec; no keyboard traps |

#### Understandable
| Criterion | Requirement | Implementation |
|---|---|---|
| 3.3.7 Accessible Authentication (NEW 2.2) | No cognitive puzzles for login | Email/password only; copy-paste allowed; no CAPTCHA puzzles |
| 3.3.8 Redundant Entry (NEW 2.2) | Auto-populate previously entered data | Browser autofill enabled; Supabase session persists preferences |

### 8.2 Design System References

| System | Adopted Patterns |
|---|---|
| **IBM Carbon** | Data-dense table patterns, dual theme tokens, enterprise accessibility |
| **Material Design 3** | Dynamic color system, responsive layout grid, component states |
| **Apple HIG** | Typography scale, dark mode philosophy, clarity over density |
| **Nielsen Norman Group** | All 10 usability heuristics applied (see §8.3) |

### 8.3 Nielsen Norman Heuristics Applied

| # | Heuristic | Application in Projeto Loja |
|---|---|---|
| 1 | Visibility of system status | Skeleton loaders, progress bars, toast confirmations, "last saved" timestamps |
| 2 | Match real world | Natural language (Portuguese), familiar icons, plain-language errors |
| 3 | User control & freedom | Undo (cancel sale), breadcrumbs, browser back-button support |
| 4 | Consistency & standards | Follow Carbon/Material conventions; consistent icon usage |
| 5 | Error prevention | Confirmation dialogs, auto-complete, inline validation, input masks |
| 6 | Recognition over recall | Visible navigation, persistent search, auto-complete suggestions |
| 7 | Flexibility & efficiency | Keyboard shortcuts (Ctrl+K, Ctrl+N), command palette, bulk actions |
| 8 | Aesthetic & minimalist | Progressive disclosure, minimal decoration, content-focused |
| 9 | Help recovery from errors | Inline errors, retry buttons, "did you mean?" suggestions |
| 10 | Help & documentation | Contextual tooltips, shortcut overlay (? key), searchable help |

---

## 9. Design System

### 9.1 Color Palette

#### Light Mode (Default — Warm Cream)
| Token | Value | Usage |
|---|---|---|
| `--bg-canvas` | `#faf7f0` | Page background (warm cream paper) |
| `--bg-card` | `#ffffff` | Card surfaces |
| `--bg-card-hover` | `#f8f4ec` | Card hover state |
| `--bg-input` | `#f8f4ec` | Form input backgrounds |
| `--text-primary` | `#1e1b18` | Headings, primary text |
| `--text-secondary` | `#5c5751` | Body text, descriptions |
| `--text-muted` | `#8c8680` | Metadata, placeholders |
| `--accent` | `#b26d2a` | Primary CTA, links, focus rings (warm copper) |
| `--accent-hover` | `#925720` | Button hover states |
| `--color-available` | `#2e7d32` | Available status |
| `--color-reserved` | `#b8860b` | Reserved status |
| `--color-sold` | `#c0392b` | Sold status |

#### Dark Mode (Linear-grade Precision)
| Token | Value | Usage |
|---|---|---|
| `--bg-canvas` | `#0d0d0e` | Deep canvas |
| `--bg-card` | `#141415` | Card surfaces (one step up) |
| `--bg-card-hover` | `#1c1c1d` | Card hover |
| `--bg-input` | `#1a1a1c` | Input backgrounds |
| `--text-primary` | `#f0efed` | 94% brightness — WCAG AAA |
| `--text-secondary` | `#b8b5b0` | 72% brightness — WCAG AAA |
| `--text-muted` | `#7c7872` | 48% brightness — WCAG AA |
| `--accent` | `#d49a50` | Luminous copper |
| `--accent-hover` | `#e0ae66` | Brighter on dark |

### 9.2 Typography

| Property | Value |
|---|---|
| **Primary font** | Inter (Google Fonts, weights 400/500/600/700) |
| **Monospace font** | JetBrains Mono (Google Fonts, weights 400/500) |
| **Base size** | 17px (`1.0625rem`) — optimized for 50+ users |
| **Line height** | 1.55 (body text) |
| **Scale** | 11px → 13px → 14px → 17px → 18px → 22px → 26px → 32px |
| **Letter spacing** | -0.01em (headings: -0.02em) |

### 9.3 Spacing & Layout

| Property | Value |
|---|---|
| **Base unit** | 8px grid |
| **Container max-width** | 1320px (1400px+ screens) |
| **Card border radius** | 12px (standard), 6px (buttons), 9999px (badges) |
| **Card shadow** | Multi-layer: `0 0 0 1px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.04)` |
| **Mobile breakpoint** | ≤768px: stacked layout, full-width cards |

### 9.4 Component Library

All UI components sourced from **shadcn/ui** (Radix UI primitives + Tailwind CSS), customized to Projeto Loja's design tokens:

- **Buttons**: solid (accent), outline, ghost, icon-only — 4 sizes
- **Cards**: default, accent-top, stat (clickable with hover lift)
- **Tables**: sticky headers, hover rows, responsive wrapper
- **Forms**: labeled inputs, selects, textareas, validation states
- **Badges**: status pills with color dots
- **Modals**: slide/fade transitions, focus trap, Escape to close
- **Toasts**: bottom-right stack, auto-dismiss 3s, pause on hover
- **Drawer (Offcanvas)**: cart as right-side panel, full-width on mobile
- **Command Palette**: Ctrl+K overlay with fuzzy search, categorized results

---

## 10. Accessibility & Compliance

### 10.1 Testing Requirements

| Test | Tool | Target |
|---|---|---|
| Automated audit | axe-core / Deque | Zero violations (Level AA) |
| Lighthouse score | Chrome DevTools | ≥ 95 Accessibility |
| Keyboard walkthrough | Manual | All functionality accessible |
| Screen reader | NVDA (Windows), VoiceOver (macOS/iOS) | Content announced correctly |
| Zoom test | Browser 200% zoom | No content loss or horizontal scroll |

### 10.2 International Compliance

| Standard | Jurisdiction | Status |
|---|---|---|
| EN 301 549 / EAA | European Union | Enforcement from June 28, 2025 |
| Section 508 | United States | Federal agencies/contractors |
| ADA Title III | United States | Increasingly applied to web apps |

### 10.3 Language & Localization

- **Primary language:** Brazilian Portuguese (pt-BR)
- All UI text, error messages, empty states, and notifications in Portuguese
- Number formatting: Brazilian locale (R$ 1.234,56)
- Date formatting: DD/MM/YYYY
- Future: English (en-US) as secondary locale

---

## 11. Expertise Requirements

### 11.1 Team Composition

| Role | Seniority | Key Skills | FTE |
|---|---|---|---|
| **Full-Stack Lead** | Senior (5+ years) | Next.js 14, TypeScript, Supabase, PostgreSQL, RLS, Tailwind CSS | 1.0 |
| **Frontend Developer** | Mid-Senior (3+ years) | React 18, shadcn/ui, Tailwind, responsive design, accessibility (WCAG 2.2), state management | 1.0 |
| **UX/UI Designer** | Senior (5+ years) | Design systems, Figma, accessibility annotations, user research, interaction design, Portuguese fluency | 0.5 |
| **QA Engineer** | Mid (3+ years) | Automated testing (Playwright/Cypress), accessibility testing (axe-core), mobile testing | 0.5 |

### 11.2 Required Technical Expertise

| Area | Specific Knowledge |
|---|---|
| **Supabase** | Auth (email/password, session management), PostgreSQL (schema design, indexes, RLS policies, migrations), Storage (buckets, policies, CDN), Realtime (subscriptions), JS client library (queries, mutations, realtime) |
| **Next.js 14** | App Router, Server Components, Client Components, route handlers, middleware, metadata API, caching strategies |
| **TypeScript** | Strict mode, generics, type inference, database type generation (`supabase gen types`) |
| **Tailwind CSS** | Design token configuration, `dark:` variant, responsive utilities, custom plugins, `@apply` patterns |
| **shadcn/ui** | Radix UI primitives, component composition, Form (react-hook-form + zod), theming via CSS variables |
| **Accessibility** | WCAG 2.2 AA, ARIA patterns, focus management, screen reader testing, color contrast verification |
| **Performance** | Core Web Vitals, bundle optimization, image optimization (next/image), code splitting |

### 11.3 Required Domain Knowledge

- Inventory management workflows (FIFO/LIFO, stock levels, SKU systems)
- Point of sale UX patterns (cart, checkout, payment, receipt)
- Small business operations (cash management, daily reconciliation, tax reporting)
- Brazilian Portuguese business terminology (nota fiscal, CPF, etc.)

---

## 12. Implementation Roadmap

### Phase 1 — Foundation (Weeks 1–2)

| Task | Est. Hours |
|---|---|
| Supabase project setup (tables, RLS, policies, Storage bucket) | 4 |
| Next.js project init + Tailwind + shadcn/ui + Supabase client | 4 |
| Database type generation (`supabase gen types`) | 1 |
| Auth flow: login, logout, session persistence, protected routes | 8 |
| Theme system: CSS variables, dark/light toggle, system preference detection, no-flicker script | 4 |
| Layout shell: navbar, responsive container, toast system, empty shell pages | 8 |
| **Subtotal** | **29 hours** |

### Phase 2 — Product Catalog (Weeks 2–3)

| Task | Est. Hours |
|---|---|
| Product table component with filters, search, pagination | 12 |
| Add/edit product form with photo upload (Supabase Storage) | 8 |
| Product detail page with reservation/sale history | 6 |
| Instant search with debounced dropdown | 4 |
| Bulk actions (select, delete, export CSV) | 6 |
| Delete with soft constraint (cannot delete sold items) | 2 |
| **Subtotal** | **38 hours** |

### Phase 3 — Cart & Sales (Weeks 3–4)

| Task | Est. Hours |
|---|---|
| Cart context (React state) with Supabase sync | 8 |
| Cart drawer (offcanvas) component with all interactions | 12 |
| Add/remove items via Supabase (optimistic updates) | 6 |
| Discount system (% and fixed) with live recalculation | 6 |
| Finalize sale (transaction: update cart + products status) | 6 |
| Cancel sale (undo) | 4 |
| Sales history page with filters (buyer, date range) | 8 |
| Sale detail page | 4 |
| Live cart badge in navbar | 2 |
| **Subtotal** | **56 hours** |

### Phase 4 — Reservations (Week 5)

| Task | Est. Hours |
|---|---|
| Reserve items via cart (multi-item reservation) | 8 |
| Reservation list with tabs (Active, Converted, Cancelled) | 6 |
| Deadline alerts (red/amber color coding) | 4 |
| Convert reservation → sale | 6 |
| Cancel reservation | 4 |
| **Subtotal** | **28 hours** |

### Phase 5 — Dashboard & UX Polish (Week 6)

| Task | Est. Hours |
|---|---|
| Dashboard layout with stat cards | 8 |
| Revenue chart (Recharts/Chart.js) | 4 |
| Activity feed (Supabase Realtime) | 6 |
| Count-up animations on stat cards | 4 |
| Command palette (Ctrl+K) | 8 |
| Global keyboard shortcuts | 4 |
| Skeleton loading states | 6 |
| Empty states for all views | 4 |
| Tooltips on action buttons | 2 |
| Focus-visible styling global | 2 |
| **Subtotal** | **48 hours** |

### Phase 6 — Testing, Mobile & Deploy (Week 7)

| Task | Est. Hours |
|---|---|
| Responsive breakpoint testing (phone, tablet, desktop) | 8 |
| Mobile UX pass (touch targets, card layouts) | 6 |
| Accessibility audit (axe-core, keyboard walkthrough) | 6 |
| Performance audit (Lighthouse, Core Web Vitals) | 4 |
| End-to-end testing (Playwright: critical paths) | 8 |
| Vercel deployment + custom domain + env vars | 4 |
| Production Supabase setup (upgrade if needed) | 2 |
| **Subtotal** | **38 hours** |

### Total Estimate

| Phase | Hours |
|---|---|
| Foundation | 29 |
| Product Catalog | 38 |
| Cart & Sales | 56 |
| Reservations | 28 |
| Dashboard & UX | 48 |
| Testing & Deploy | 38 |
| **Total** | **237 hours (~6–7 weeks full-time)** |

---

## 13. Success Metrics

### 13.1 User Adoption

| Metric | Target (Month 3) | Target (Month 12) |
|---|---|---|
| Registered shops | 50 | 500 |
| Weekly active users | 30 | 300 |
| Products cataloged | 5,000 | 100,000 |
| Sales processed/month | 200 | 5,000 |

### 13.2 Quality

| Metric | Target |
|---|---|
| Lighthouse Accessibility | ≥ 95 |
| axe-core violations | 0 (Level AA) |
| Core Web Vitals (LCP) | ≤ 2.5s |
| Page load (3G) | ≤ 3s |
| Cart add latency (AJAX) | ≤ 200ms |

### 13.3 User Satisfaction

| Metric | Target |
|---|---|
| Task completion rate (add product) | ≥ 95% |
| Task completion rate (complete sale) | ≥ 90% |
| Time to first sale (new user) | ≤ 5 minutes |
| Support tickets/user/month | ≤ 1 |

---

## 14. Appendices

### A. Glossary

| Term | Definition |
|---|---|
| RLS | Row Level Security — PostgreSQL policy that filters rows per authenticated user |
| SKU | Stock Keeping Unit — unique identifier for a product (REL-XXXX format) |
| POS | Point of Sale — the checkout/payment workflow |
| Offcanvas | Bootstrap component — slide-in panel from edge of screen |
| WCAG | Web Content Accessibility Guidelines — W3C standard for web accessibility |
| PWA | Progressive Web App — installable web application with offline support |
| JWT | JSON Web Token — used by Supabase Auth for session management |

### B. References

- **Supabase Documentation:** https://supabase.com/docs
- **Next.js Documentation:** https://nextjs.org/docs
- **shadcn/ui:** https://ui.shadcn.com
- **WCAG 2.2:** https://www.w3.org/TR/WCAG22/
- **Material Design 3:** https://m3.material.io/
- **IBM Carbon Design System:** https://carbondesignsystem.com/
- **NN/g 10 Usability Heuristics:** https://www.nngroup.com/articles/ten-usability-heuristics/
- **EN 301 549 / European Accessibility Act:** Enforcement from June 28, 2025

### C. Competitive Research Sources

Market data compiled from: Grand View Research, GM Insights, Mordor Intelligence, IBISWorld, Worldwide Market Reports, Capterra, G2, Software Advice, vendor pricing pages, and community reviews. All data reflects publicly available information as of June 2026.

---

*Document prepared for Projeto Loja v3.0 — Supabase Edition. Ready for stakeholder review and implementation kickoff.*
