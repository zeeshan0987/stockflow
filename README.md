# stockflow
Real-time inventory tracking


# StockFlow Backend – MVP

Node.js + Express + Prisma + SQLite REST API for the StockFlow inventory management MVP.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env if needed (JWT_SECRET at minimum in production)

# 3. Create the database & run migrations
npm run db:push

# 4. (Optional) Seed demo data
npm run db:seed
#    → Login: demo@stockflow.dev / password123

# 5. Start dev server
npm run dev
#    → http://localhost:4000
```

## API Reference

### Auth
| Method | Path | Body | Description |
|--------|------|------|-------------|
| POST | `/api/auth/signup` | `{ email, password, organizationName }` | Register new user + org |
| POST | `/api/auth/login` | `{ email, password }` | Login, returns JWT |
| GET | `/api/auth/me` | — | Current user info |

All other routes require `Authorization: Bearer <token>` header.

### Products
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/products` | List products (query: `search`, `page`, `limit`) |
| GET | `/api/products/:id` | Get single product + stock history |
| POST | `/api/products` | Create product |
| PATCH | `/api/products/:id` | Update product fields |
| DELETE | `/api/products/:id` | Soft-delete product |
| POST | `/api/products/:id/adjust-stock` | Adjust quantity (`{ delta, note }`) |

### Dashboard
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/dashboard` | Summary stats + low-stock items |

### Settings
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/settings` | Get org settings |
| PATCH | `/api/settings` | Update `defaultLowStockThreshold` |

## Database Schema

```
Organization ──< User
     │
     └──< Product ──< StockAdjustment
```

- **Organization**: tenant root; holds `defaultLowStockThreshold`
- **User**: one per org in MVP; holds hashed password
- **Product**: core entity; `deletedAt` enables soft delete; `lowStockThreshold` overrides org default
- **StockAdjustment**: lightweight delta log when stock is adjusted

## Switching to PostgreSQL

1. Change `provider = "postgresql"` in `prisma/schema.prisma`
2. Set `DATABASE_URL="postgresql://user:pass@host:5432/stockflow"` in `.env`
3. Run `npm run db:push` (or `prisma migrate dev` for production-grade migrations)

