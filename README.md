# Digital Office OS - Day-1 Scaffold

A fully visual, navigable, monitored, governed Digital Office Platform.

## Quick Start

### 1. Backend Setup

```bash
cd backend

# Copy environment file
cp .env.example .env
# Edit .env with your database credentials

# Install dependencies
npm install

# Run migrations (creates tables + default user)
npm run db:migrate

# Start server
npm run dev
```

Server runs at `http://localhost:4000`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

App runs at `http://localhost:3000`

### 3. Default Login

- **Email:** admin@empire.io
- **Password:** admin123

## What's Included

### Backend (`/backend`)
- ✅ Express.js API server
- ✅ PostgreSQL connection + full schema
- ✅ JWT authentication
- ✅ WebSocket real-time updates
- ✅ Activity logging
- ✅ All API routes:
  - `/api/v1/auth` - Login, register, current user
  - `/api/v1/portfolio` - Portfolio summary
  - `/api/v1/creators` - Creator CRUD + autonomy
  - `/api/v1/agents` - Agent details + autonomy
  - `/api/v1/tasks` - Task management
  - `/api/v1/activity` - Activity log + digest
  - `/api/v1/approvals` - Approval workflow

### Frontend (`/frontend`)
- ✅ Next.js 14 App Router
- ✅ Tailwind CSS styling
- ✅ Authentication context
- ✅ Sidebar navigation with creator tree
- ✅ All screen shells:
  - Command Center (home)
  - Portfolio view
  - Creator Dashboard
  - Agent Workspace
  - Execution Console
  - Activity Log
  - War Room
  - File System
  - Settings

### Interactive Prototype (`/prototype`)
- ✅ Single HTML file
- ✅ Clickable navigation
- ✅ All major screens
- ✅ No dependencies needed
- Just open `prototype/index.html` in browser

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Backend    │────▶│  PostgreSQL  │
│  (Next.js)   │     │  (Express)   │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │
       │                    ▼
       │             ┌──────────────┐
       └────────────▶│    Redis     │
         WebSocket   │   (Queue)    │
                     └──────────────┘
```

## Database Schema

Core tables:
- `users` - Authentication
- `portfolios` - Top-level container
- `creators` - Creator pods
- `agents` - 15 agents per creator
- `tasks` - Agent task queue
- `decisions` - Decision records
- `approvals` - Approval workflow
- `activity_log` - Full audit trail
- `metrics_daily` - KPI time series
- `owner_actions` - Owner tracking

## Next Steps

1. Set up PostgreSQL database
2. Configure `.env` files
3. Run migrations
4. Start backend and frontend
5. Log in and explore

## Build Specifications

Full documentation in `/empire-blueprint/BUILD/`:
- 01-NAVIGATION-MAP.md
- 02-UI-WIREFRAMES.md
- 03-DATA-MODEL.md
- 04-RUNTIME-ARCHITECTURE.md
- 05-MONITORING-DESIGN.md
- 06-EXECUTION-FLOW.md
- 07-BUILD-ROADMAP.md

---

**Status:** Day-1 scaffold ready for development team.
