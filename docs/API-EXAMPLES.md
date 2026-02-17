# API Examples

Base URL: `http://localhost:4000`

## Authentication

### Login
```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@empire.io", "password": "admin123"}'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@empire.io",
    "name": "Admin",
    "role": "owner"
  }
}
```

### Get Current User
```bash
curl http://localhost:4000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Portfolio

### Get Portfolio Summary
```bash
curl http://localhost:4000/api/v1/portfolio \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Creators

### List Creators
```bash
curl http://localhost:4000/api/v1/creators \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Single Creator
```bash
curl http://localhost:4000/api/v1/creators/CREATOR_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Creator
```bash
curl -X POST http://localhost:4000/api/v1/creators \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Creator B",
    "brandName": "Brand B",
    "portfolioId": "PORTFOLIO_ID"
  }'
```

### Set Creator Autonomy
```bash
curl -X PUT http://localhost:4000/api/v1/creators/CREATOR_ID/autonomy \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"level": 2}'
```

---

## Agents

### Get Agent Details
```bash
curl http://localhost:4000/api/v1/agents/AGENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response includes: agent, tasks, decisions, activity

### Set Agent Autonomy
```bash
curl -X PUT http://localhost:4000/api/v1/agents/AGENT_ID/autonomy \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"level": 1}'
```

---

## Tasks

### List Tasks
```bash
# All tasks
curl http://localhost:4000/api/v1/tasks \
  -H "Authorization: Bearer YOUR_TOKEN"

# Filter by status
curl "http://localhost:4000/api/v1/tasks?status=pending" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Filter by agent
curl "http://localhost:4000/api/v1/tasks?agentId=AGENT_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Task
```bash
curl -X POST http://localhost:4000/api/v1/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "AGENT_ID",
    "creatorId": "CREATOR_ID",
    "title": "Review creative performance",
    "description": "Check for fatigue on top performers",
    "priority": "normal"
  }'
```

### Update Task Status
```bash
curl -X PUT http://localhost:4000/api/v1/tasks/TASK_ID/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "in_progress"}'
```

---

## Activity Log

### Get Activity Feed
```bash
# Default (all levels)
curl http://localhost:4000/api/v1/activity \
  -H "Authorization: Bearer YOUR_TOKEN"

# Filter by level (1-2 = high priority only)
curl "http://localhost:4000/api/v1/activity?level=2" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Filter by creator
curl "http://localhost:4000/api/v1/activity?creatorId=CREATOR_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Daily Digest
```bash
curl http://localhost:4000/api/v1/activity/digest \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Activity Entry
```bash
curl -X POST http://localhost:4000/api/v1/activity \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "creatorId": "CREATOR_ID",
    "agentId": "AGENT_ID",
    "eventType": "decision.executed",
    "eventLevel": 3,
    "title": "Budget scaled +20%",
    "description": "Ad Set Cold-Interest",
    "marginImpact": 125.00
  }'
```

---

## Approvals

### List Pending Approvals
```bash
curl http://localhost:4000/api/v1/approvals \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Single Approval
```bash
curl http://localhost:4000/api/v1/approvals/APPROVAL_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Approve
```bash
curl -X POST http://localhost:4000/api/v1/approvals/APPROVAL_ID/approve \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"comment": "Looks good, proceed"}'
```

### Reject
```bash
curl -X POST http://localhost:4000/api/v1/approvals/APPROVAL_ID/reject \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"comment": "Risk too high, wait for more data"}'
```

---

## Health Check

```bash
curl http://localhost:4000/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T14:30:00.000Z"
}
```
