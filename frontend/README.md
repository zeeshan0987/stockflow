# StockFlow Frontend

Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.local.example .env.local
# Set NEXT_PUBLIC_API_URL to your backend URL

# 3. Run dev server
npm run dev
# → http://localhost:3000
```

## Project Structure

```
src/
├── app/
│   ├── auth/
│   │   ├── login/        ← Login page
│   │   └── signup/       ← Sign up page
│   ├── dashboard/        ← Stats + low-stock overview
│   ├── products/
│   │   ├── [id]/         ← Product detail view
│   │   │   └── edit/     ← Edit product form
│   │   ├── new/          ← Create product form
│   │   ├── page.tsx      ← Products list with search
│   │   ├── ProductForm.tsx
│   │   └── StockAdjustDialog.tsx
│   └── settings/         ← Org settings
├── components/
│   ├── layout/
│   │   └── AppShell.tsx  ← Sidebar + mobile nav
│   └── ui/               ← shadcn/ui components
├── hooks/
│   └── useAuth.ts        ← Auth state (localStorage)
├── lib/
│   ├── api.ts            ← Typed API client
│   └── utils.ts          ← cn(), formatCurrency(), etc.
└── types/
    └── index.ts           ← Shared TypeScript types
```

## Pages

| Route | Description |
|-------|-------------|
| `/auth/login` | Email + password login |
| `/auth/signup` | Register org + user |
| `/dashboard` | KPI cards + low-stock table |
| `/products` | Searchable product list with inline stock adjust |
| `/products/new` | Create product form |
| `/products/[id]` | Product detail + stock history |
| `/products/[id]/edit` | Edit product |
| `/settings` | Org default low-stock threshold |

## Auth

JWT stored in `localStorage`. All app routes redirect to `/auth/login` if no token is present.
