# Digital Office OS

Sovereign Digital Revenue Empire - Command Center Platform

## Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+ (optional, for job queues)

## Quick Start

### 1. Database Setup

Create a PostgreSQL database:
```sql
CREATE DATABASE digital_office;
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database URL:
# DATABASE_URL=postgresql://user:password@localhost:5432/digital_office
# JWT_SECRET=your-secret-key-change-this

# Run migrations (creates all tables)
npm run db:migrate

# Seed sample data (optional but recommended)
npm run db:seed

# Start server
npm run dev
```

Server runs at `http://localhost:4000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Default is fine for local dev

# Start development server
npm run dev
```

App runs at `http://localhost:3000`

### 4. Login

- **Email:** admin@empire.io
- **Password:** admin123

---

## Project Structure

```
digital-office-os/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── index.js      # Database connection
│   │   │   ├── migrate.js    # Schema migration
│   │   │   └── seed.js       # Sample data
│   │   ├── routes/
│   │   │   ├── auth.js       # Authentication
│   │   │   ├── portfolio.js  # Portfolio endpoints
│   │   │   ├── creators.js   # Creator CRUD
│   │   │   ├── agents.js     # Agent endpoints
│   │   │   ├── tasks.js      # Task management
│   │   │   ├── activity.js   # Activity log
│   │   │   └── approvals.js  # Approval workflow
│   │   ├── middleware/
│   │   │   └── auth.js       # JWT validation
│   │   ├── websocket/
│   │   │   └── index.js      # Real-time events
│   │   ├── utils/
│   │   │   └── logger.js     # Logging
│   │   └── index.js          # Server entry
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (dashboard)/  # Protected routes
│   │   │   │   ├── page.tsx           # Command Center
│   │   │   │   ├── portfolio/         # Portfolio view
│   │   │   │   ├── creators/[id]/     # Creator dashboard
│   │   │   │   ├── agents/[id]/       # Agent workspace
│   │   │   │   ├── execution/         # Execution console
│   │   │   │   ├── activity/          # Activity log
│   │   │   │   ├── war-room/          # War room
│   │   │   │   ├── files/             # File system
│   │   │   │   └── settings/          # Settings
│   │   │   ├── login/        # Login page
│   │   │   └── layout.tsx    # Root layout
│   │   ├── components/
│   │   │   └── Sidebar.tsx   # Navigation sidebar
│   │   └── lib/
│   │       ├── api.ts        # API client
│   │       └── auth-context.tsx  # Auth state
│   ├── .env.example
│   └── package.json
├── prototype/
│   └── index.html            # Interactive HTML mockup
├── docs/
│   └── API-EXAMPLES.md       # curl examples
└── README.md
```

---

## Database Schema

Migration creates these tables:

| Table | Purpose |
|-------|---------|
| `users` | Authentication |
| `portfolios` | Top-level container |
| `creators` | Creator pods with settings |
| `agents` | 10+ agents per creator |
| `tasks` | Agent task queue |
| `decisions` | Decision records |
| `approvals` | Approval workflow |
| `activity_log` | Full audit trail |
| `metrics_daily` | KPI time series |
| `owner_actions` | Owner tracking |
| `sessions` | Token sessions |

---

## API Documentation

See `docs/API-EXAMPLES.md` for complete curl examples.

Quick test after setup:
```bash
# Login
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@empire.io", "password": "admin123"}'

# Use returned token for other requests
curl http://localhost:4000/api/v1/portfolio \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## What's Implemented

| Component | Status |
|-----------|--------|
| PostgreSQL schema | ✅ Real |
| Database migrations | ✅ Real |
| JWT authentication | ✅ Real |
| API routes (CRUD) | ✅ Real |
| Activity log persistence | ✅ Real |
| Frontend navigation | ✅ Real |
| Protected routes | ✅ Real |
| WebSocket server | ✅ Setup done |

## What's Stubbed/Mock

| Component | Status |
|-----------|--------|
| KPI calculations | Mock (hardcoded) |
| External APIs (Meta, Google, Stripe) | Not implemented |
| Decision rule engine | Not implemented |
| Background job processing | Not implemented |
| Rollback execution | Not implemented |
| Real-time event broadcasting | Partial |

---

## Interactive Prototype

Open `prototype/index.html` in any browser for a clickable mockup - no server needed.

---

## Development

```bash
# Backend (with auto-reload)
cd backend && npm run dev

# Frontend (with hot reload)
cd frontend && npm run dev
```

## Production Build

```bash
# Frontend
cd frontend && npm run build && npm start

# Backend
cd backend && npm start
```

---

## License

Private - All rights reserved.
