<div align="center">

# ⚡ RetailPOS

### A Production-Grade Point-of-Sale System for Modern Retail

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)
![React](https://img.shields.io/badge/react-18.3-61DAFB)
![PostgreSQL](https://img.shields.io/badge/postgresql-14%2B-4169E1)
![Express](https://img.shields.io/badge/express-5.x-000000)

**Full-stack retail management console** — sales, purchases, inventory, parties, reports, and system administration in a single secure application.

[Getting Started](#-getting-started) · [Features](#-features) · [API Reference](#-api-reference) · [Architecture](#-architecture) · [Database](#-database-schema)

---

```
 ███╗   ██╗███████╗████████╗ █████╗     ██████╗ ███████╗██╗   ██╗
 ████╗  ██║██╔════╝╚══██╔══╝██╔══██╗    ██╔══██╗██╔════╝██║   ██║
 ██╔██╗ ██║█████╗     ██║   ███████║    ██║  ██║█████╗  ██║   ██║
 ██║╚██╗██║██╔══╝     ██║   ██╔══██║    ██║  ██║██╔══╝  ╚██╗ ██╔╝
 ██║ ╚████║███████╗   ██║   ██║  ██║    ██████╔╝███████╗ ╚████╔╝
 ╚═╝  ╚═══╝╚══════╝   ╚═╝   ╚═╝  ╚═╝    ╚═════╝ ╚══════╝  ╚═══╝
```

</div>

---

## 📸 Screenshots

<div align="center">

| Dashboard | Sales Terminal | Inventory |
|-----------|---------------|-----------|
| ![Dashboard](https://via.placeholder.com/400x250/1a1a2e/00d4ff?text=Dashboard) | ![Sales](https://via.placeholder.com/400x250/1a1a2e/00d4ff?text=Sales+Terminal) | ![Inventory](https://via.placeholder.com/400x250/1a1a2e/00d4ff?text=Inventory) |

| Command Center | Reports | Settings |
|----------------|---------|----------|
| ![Command Center](https://via.placeholder.com/400x250/1a1a2e/00d4ff?text=Command+Center) | ![Reports](https://via.placeholder.com/400x250/1a1a2e/00d4ff?text=Reports) | ![Settings](https://via.placeholder.com/400x250/1a1a2e/00d4ff?text=Settings) |

</div>

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (React SPA)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐    │
│  │ Dashboard │  │  Sales   │  │Inventory │  │  Reports     │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘    │
│       │              │              │               │            │
│  ┌────┴──────────────┴──────────────┴───────────────┴───────┐   │
│  │              Axios + React Query + Auth Context           │   │
│  └──────────────────────────┬────────────────────────────────┘   │
└─────────────────────────────┼────────────────────────────────────┘
                              │ HTTP / JSON + JWT Bearer Token
┌─────────────────────────────┼────────────────────────────────────┐
│                        SERVER (Express)                           │
│  ┌──────────────────────────┴────────────────────────────────┐   │
│  │  Rate Limiter  →  CORS  →  Helmet  →  Body Parser         │   │
│  └──────────────────────────┬────────────────────────────────┘   │
│                              │                                    │
│  ┌─────────┐  ┌─────────────┼─────────────┐  ┌──────────────┐   │
│  │  Auth   │  │  Controllers │  Middleware  │  │  Error Hdlr  │   │
│  │ Service │  │  (8 modules) │  (auth/role) │  │              │   │
│  └────┬────┘  └──────┬──────┘  └────────────┘  └──────────────┘   │
│       │              │                                            │
│  ┌────┴──────────────┴────────────────────────────────────────┐   │
│  │                   Service Layer (8)                        │   │
│  │  Auth │ Product │ Sales │ Purchase │ Inventory │ Party     │   │
│  └──────────────────────────┬─────────────────────────────────┘   │
│                              │                                    │
│  ┌──────────────────────────┴─────────────────────────────────┐   │
│  │                 Repository Layer (8)                       │   │
│  │            SQL queries + parameterized inputs              │   │
│  └──────────────────────────┬─────────────────────────────────┘   │
└─────────────────────────────┼────────────────────────────────────┘
                              │
┌─────────────────────────────┼────────────────────────────────────┐
│                      PostgreSQL 14+                               │
│  ┌────────┐ ┌──────────┐ ┌─────────┐ ┌──────────┐ ┌─────────┐  │
│  │ users  │ │ products │ │ invoices│ │  parties │ │  stock  │  │
│  └────────┘ └──────────┘ └─────────┘ └──────────┘ └─────────┘  │
│  ┌──────────────┐ ┌──────────────┐ ┌───────────┐ ┌──────────┐  │
│  │product_units │ │invoice_items │ │  payments │ │  ledger  │  │
│  └──────────────┘ └──────────────┘ └───────────┘ └──────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version | Check |
|-------------|---------|-------|
| Node.js | ≥ 18 | `node -v` |
| PostgreSQL | ≥ 14 | `psql --version` |
| pnpm | ≥ 10 | `pnpm -v` |

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/RPS_Retails_Console.git
cd RPS_Retails_Console

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && pnpm install
```

### 2. Configure Environment

```bash
# backend/.env (already configured for local dev)
PORT=5000
JWT_SECRET=your-secret-key
DATABASE_URL=postgresql://postgres@localhost:5432/pos_db
CORS_ORIGINS=http://localhost:8080,http://localhost:3000
```

### 3. Setup Database

```bash
# Create database and run schema
psql -U postgres -c "CREATE DATABASE pos_db;"
psql -U postgres -d pos_db -f backend/schema.sql

# Load seed data (optional)
psql -U postgres -d pos_db -f backend/seed.sql
```

### 4. Start Development

```bash
# Terminal 1 — Backend (port 5000)
cd backend && npm run dev

# Terminal 2 — Frontend (port 8080)
cd frontend && pnpm dev
```

### 5. Login

| Field | Value |
|-------|-------|
| URL | `http://localhost:8080` |
| Username | `admin` |
| Password | `admin123` |

---

## ✨ Features

### 💰 Sales & Purchases
- **Multi-item invoicing** with line-by-line product entry
- **Quick sale drafts** — hold and resume transactions
- **Sales & purchase returns** with validation
- **Auto-generated invoice numbers** (SAL-001001, PUR-001001, etc.)
- **Multi-payment support** — Cash, UPI, Credit, Card, Bank Transfer
- **Barcode scanning** at POS terminal

### 📦 Inventory Management
- **Real-time stock tracking** via stock_movements ledger
- **Multi-unit support** with conversion factors (PCS, BOX, CASE)
- **Barcode per product unit**
- **Low stock alerts** based on configurable reorder levels
- **Manual stock adjustments** (owner only)
- **Stock movement history** with full audit trail

### 👥 Party Management (CRM)
- **Customer & supplier** profiles with contact info
- **Credit limits** per party
- **Party ledger** — full debit/credit accounting
- **Outstanding balance** tracking

### 📊 Reports & Analytics
- **Dashboard** — today's sales, purchases, receivables, payables
- **Sales reports** with date range filtering
- **Top products** analysis
- **Inventory valuation** report
- **Receivables** report
- **Export to Excel/CSV** for external analysis

### 🖥️ Command Center
- **Live system telemetry** — uptime, DB status, latency
- **Real-time diagnostics** — product count, party count, low stock alerts
- **Animated terminal boot sequence**
- **Auto-refreshing** system health every 30 seconds

### 🔐 Security & Access Control
- **JWT authentication** with 12-hour expiry
- **bcrypt password hashing** (12 salt rounds)
- **4-tier role system** — Owner, Manager, Worker, Cashier
- **Feature-level access matrix** per role
- **Rate limiting** — Auth: 20 req/15min, API: 200 req/min
- **Helmet security headers** on all responses
- **CORS whitelist** for allowed origins

---

## 🔌 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Login and receive JWT token |
| `GET` | `/api/auth/me` | Get current user profile |
| `POST` | `/api/auth/change-password` | Change password |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/products` | List all products |
| `GET` | `/api/products/search?q=` | Search products by name |
| `GET` | `/api/products/barcode/:code` | Lookup by barcode |
| `POST` | `/api/products` | Create product with units |
| `PUT` | `/api/products/:id` | Update product |
| `DELETE` | `/api/products/:id` | Delete product |

### Sales
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/sales/create` | Create sales invoice |
| `POST` | `/api/sales/return` | Process sales return |
| `GET` | `/api/sales/:id` | Get invoice details |
| `POST` | `/api/sales/quick` | Save quick sale draft |
| `GET` | `/api/sales/quick` | List quick sale drafts |
| `DELETE` | `/api/sales/quick/:id` | Delete quick sale draft |

### Purchases
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/purchase/create` | Create purchase invoice |
| `GET` | `/api/purchase/:id` | Get purchase details |

### Inventory
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/inventory` | Full stock position |
| `GET` | `/api/inventory/movements` | Stock movement history |
| `GET` | `/api/inventory/low-stock` | Low stock alerts |
| `POST` | `/api/inventory/adjust` | Manual adjustment *(owner)* |

### Parties
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/parties` | List all parties |
| `POST` | `/api/parties` | Create party |
| `PUT` | `/api/parties/:id` | Update party |
| `DELETE` | `/api/parties/:id` | Delete party |
| `GET` | `/api/parties/:id/ledger` | Party ledger entries |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/reports/dashboard` | Dashboard summary |
| `GET` | `/api/reports/sales?from=&to=` | Sales report |
| `GET` | `/api/reports/top-products` | Top products |
| `GET` | `/api/reports/inventory-value` | Stock valuation |

### System
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/api/system` | System telemetry (uptime, DB, counts) |

> **Base URL:** `http://localhost:5000` · All endpoints (except `/health` and `/api/system`) require `Authorization: Bearer <token>` header.

---

## 🗃️ Database Schema

```
┌─────────────────┐     ┌──────────────────┐
│      users       │     │     products      │
├─────────────────┤     ├──────────────────┤
│ id              │     │ id               │
│ username        │     │ name             │
│ password_hash   │     │ sku              │
│ role            │     │ category         │
│ active          │     │ reorder_level    │
└────────┬────────┘     └────────┬─────────┘
         │                       │
         │                ┌──────┴──────────┐
         │                │  product_units   │
         │                ├─────────────────┤
         │                │ id              │
         │                │ product_id (FK) │
         │                │ unit_name       │
         │                │ conversion_factor│
         │                │ barcode         │
         │                │ mrp             │
         │                │ purchase_rate   │
         │                │ sales_rate      │
         │                │ gst_percent     │
         │                └────────┬────────┘
         │                         │
┌────────┴────────┐         ┌──────┴──────┐
│     parties      │         │     │       │
├─────────────────┤    ┌─────┴───┐ │  ┌────┴──────────┐
│ id              │    │invoices │ │  │stock_movements │
│ name            │    ├─────────┤ │  ├───────────────┤
│ phone           │    │id       │ │  │id             │
│ type (c/s)      │    │inv_num  │ │  │product_unit_id│
│ credit_limit    │    │type     │ │  │quantity       │
│ outstanding     │    │party_id─┘ │  │movement_type  │
└────────┬────────┘    │subtotal   │  │reference_id   │
         │             │discount   │  │created_by     │
         │             │tax        │  └───────────────┘
         │             │grand_total│
         │             │created_by─┘
         │                  │
    ┌────┴─────┐     ┌──────┴────────┐
    │ payments  │     │invoice_items  │
    ├──────────┤     ├───────────────┤
    │id        │     │id             │
    │invoice_id│     │invoice_id (FK)│
    │method    │     │product_unit_id│
    │amount    │     │quantity       │
    └──────────┘     │rate           │
                     │total          │
    ┌────────────┐   └───────────────┘
    │   ledger    │
    ├────────────┤
    │id          │
    │party_id(FK)│
    │invoice_id  │
    │entry_type  │
    │amount      │
    │description │
    └────────────┘
```

| Table | Records | Description |
|-------|---------|-------------|
| `users` | 4 | System users with role-based access |
| `products` | 20 | Product catalog |
| `product_units` | 20 | Unit definitions with pricing |
| `parties` | 20 | Customers & suppliers |
| `invoices` | 22 | Sales & purchase transactions |
| `invoice_items` | — | Line items per invoice |
| `stock_movements` | — | Stock audit trail |
| `payments` | — | Payment records |
| `ledger_entries` | — | Party accounting ledger |
| `sales_drafts` | — | Quick sale draft storage |

---

## 📁 Project Structure

```
RPS_Retails_Console/
├── frontend/                          # React SPA (Vite)
│   ├── src/
│   │   ├── App.jsx                    # Route definitions
│   │   ├── main.jsx                   # Entry point
│   │   ├── pages/                     # 12 page components
│   │   │   ├── Dashboard.jsx          # Home metrics & alerts
│   │   │   ├── Sales.jsx              # POS terminal
│   │   │   ├── Purchase.jsx           # Purchase entry
│   │   │   ├── Inventory.jsx          # Stock management
│   │   │   ├── Parties.jsx            # CRM (customers/suppliers)
│   │   │   ├── Reports.jsx            # Analytics & exports
│   │   │   ├── Settings.jsx           # Users & backup
│   │   │   ├── CommandCenter.jsx      # System telemetry
│   │   │   └── Login.jsx              # Authentication
│   │   ├── components/
│   │   │   ├── Layout.jsx             # Sidebar + header
│   │   │   └── ui/                    # 50+ Radix UI components
│   │   ├── hooks/
│   │   │   ├── use-auth.jsx           # Auth context & provider
│   │   │   └── use-toast.js           # Toast notifications
│   │   └── lib/
│   │       ├── api.js                 # Axios instance + API clients
│   │       └── utils.js               # cn() utility
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/                           # Express API server
│   ├── src/
│   │   ├── app.js                     # Express app + route mounting
│   │   ├── server.js                  # HTTP server entry
│   │   ├── config/
│   │   │   ├── db.js                  # PostgreSQL pool
│   │   │   └── env.js                 # Environment config
│   │   ├── routes/                    # 9 route modules
│   │   ├── controllers/               # 8 controllers
│   │   ├── services/                  # 8 business logic modules
│   │   ├── repositories/              # 8 data access modules
│   │   ├── middleware/                 # Auth, role, error handlers
│   │   └── utils/                     # ApiError, logger
│   ├── schema.sql                     # Database DDL (10 tables)
│   ├── seed.sql                       # Sample data
│   └── .env                           # Environment variables
│
└── README.md
```

---

## 🛡️ Security

| Layer | Implementation |
|-------|---------------|
| **Authentication** | JWT tokens with 12h expiry, signed with `JWT_SECRET` |
| **Password Storage** | bcrypt with 12 salt rounds |
| **HTTP Headers** | Helmet.js — XSS protection, content-type sniffing prevention |
| **Rate Limiting** | Auth: 20 req / 15 min · API: 200 req / min |
| **CORS** | Whitelist-based origin validation |
| **Input Validation** | Service-layer validation on all write operations |
| **SQL Injection** | Parameterized queries via `pg` driver |
| **Role Authorization** | 4-tier RBAC with per-route middleware |
| **Body Size Limit** | 1MB max request payload |

### Role Access Matrix

| Feature | Owner | Manager | Worker | Cashier |
|---------|:-----:|:-------:|:------:|:-------:|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Sales | ✅ | ✅ | ✅ | ✅ |
| Purchase | ✅ | ✅ | ❌ | ❌ |
| Inventory | ✅ | ✅ | ✅ | ❌ |
| Parties | ✅ | ✅ | ✅ | ❌ |
| Reports | ✅ | ✅ | ❌ | ❌ |
| Stock Adjust | ✅ | ❌ | ❌ | ❌ |
| User Mgmt | ✅ | ❌ | ❌ | ❌ |
| Backup/Restore | ✅ | ❌ | ❌ | ❌ |

---

## 🧰 Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| React 18 | UI library |
| React Router 6 | Client-side routing |
| Vite 7 | Build tool & dev server |
| Tailwind CSS 3 | Utility-first styling |
| Radix UI | Headless UI primitives |
| TanStack React Query | Server state management |
| Axios | HTTP client |
| Lucide React | Icon library |
| Recharts | Charts & graphs |
| Framer Motion | Animations |
| Sonner | Toast notifications |

### Backend

| Technology | Purpose |
|------------|---------|
| Node.js | JavaScript runtime |
| Express 5 | Web framework |
| PostgreSQL | Relational database |
| pg (node-postgres) | Database driver |
| JWT | Stateless authentication |
| bcrypt | Password hashing |
| Helmet | Security headers |
| express-rate-limit | Rate limiting |
| ExcelJS | Excel export |
| json2csv | CSV export |

---

## 📊 Project Statistics

| Metric | Value |
|--------|-------|
| **Total Source Files** | 113 |
| **Frontend Components** | 64 JSX + 5 JS |
| **Backend Modules** | 42 JS |
| **API Endpoints** | 40 |
| **Database Tables** | 10 |
| **Database Functions** | 2 |
| **Frontend Pages** | 12 |
| **Role Tiers** | 4 |
| **UI Components** | 50+ |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with ❤️ KernelRaise for modern retail**

</div>
