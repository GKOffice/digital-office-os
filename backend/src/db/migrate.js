import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;

const schema = `
-- Users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'viewer',
    created_at TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP
);

-- Portfolio
CREATE TABLE IF NOT EXISTS portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    owner_id UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Creators
CREATE TABLE IF NOT EXISTS creators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID REFERENCES portfolios(id),
    name VARCHAR(255) NOT NULL,
    brand_name VARCHAR(255),
    tier VARCHAR(1) CHECK (tier IN ('S','A','B','C','X')) DEFAULT 'B',
    status VARCHAR(20) DEFAULT 'active',
    autonomy_level INTEGER DEFAULT 0 CHECK (autonomy_level BETWEEN 0 AND 3),
    current_risk_index INTEGER DEFAULT 50,
    current_data_confidence INTEGER DEFAULT 100,
    current_performance_score INTEGER DEFAULT 50,
    settings JSONB DEFAULT '{}',
    thresholds JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Agents
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES creators(id),
    agent_type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    cluster VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    autonomy_level INTEGER DEFAULT 0,
    accuracy_score DECIMAL(5,2) DEFAULT 100.00,
    sla_adherence DECIMAL(5,2) DEFAULT 100.00,
    risk_index INTEGER DEFAULT 0,
    rollback_count_30d INTEGER DEFAULT 0,
    kpis_owned TEXT[],
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES agents(id),
    creator_id UUID REFERENCES creators(id),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'normal',
    status VARCHAR(20) DEFAULT 'pending',
    context JSONB DEFAULT '{}',
    due_at TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    result JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Decisions
CREATE TABLE IF NOT EXISTS decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES agents(id),
    creator_id UUID REFERENCES creators(id),
    task_id UUID REFERENCES tasks(id),
    decision_type VARCHAR(50) NOT NULL,
    rule_triggered VARCHAR(100),
    inputs JSONB NOT NULL,
    decision TEXT NOT NULL,
    action_plan JSONB,
    projected_impact JSONB,
    actual_impact JSONB,
    margin_impact DECIMAL(12,2),
    risk_change INTEGER,
    status VARCHAR(20) DEFAULT 'proposed',
    requires_approval BOOLEAN DEFAULT false,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    rollback_available BOOLEAN DEFAULT true,
    rollback_data JSONB,
    rolled_back BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    executed_at TIMESTAMP
);

-- Approvals
CREATE TABLE IF NOT EXISTS approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_id UUID REFERENCES decisions(id) UNIQUE,
    priority VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    action VARCHAR(20),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    deadline_at TIMESTAMP
);

-- Activity Log
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID REFERENCES portfolios(id),
    creator_id UUID REFERENCES creators(id),
    agent_id UUID REFERENCES agents(id),
    event_type VARCHAR(50) NOT NULL,
    event_level INTEGER NOT NULL CHECK (event_level BETWEEN 1 AND 4),
    entity_type VARCHAR(50),
    entity_id UUID,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    before_state JSONB,
    after_state JSONB,
    justification JSONB,
    risk_assessment INTEGER,
    margin_impact DECIMAL(12,2),
    cash_impact DECIMAL(12,2),
    decision_id UUID REFERENCES decisions(id),
    task_id UUID REFERENCES tasks(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Metrics Daily
CREATE TABLE IF NOT EXISTS metrics_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES creators(id),
    date DATE NOT NULL,
    revenue DECIMAL(12,2),
    refunds DECIMAL(12,2),
    net_revenue DECIMAL(12,2),
    ad_spend DECIMAL(12,2),
    roas DECIMAL(5,2),
    cpa DECIMAL(10,2),
    conversions INTEGER,
    page_views INTEGER,
    cvr DECIMAL(5,4),
    aov DECIMAL(10,2),
    ltv DECIMAL(10,2),
    ltv_cac DECIMAL(5,2),
    refund_rate DECIMAL(5,4),
    risk_index INTEGER,
    data_confidence INTEGER,
    contribution_margin DECIMAL(12,2),
    margin_percent DECIMAL(5,4),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(creator_id, date)
);

-- Owner Actions
CREATE TABLE IF NOT EXISTS owner_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action_type VARCHAR(50) NOT NULL,
    target_type VARCHAR(50),
    target_id UUID,
    original_decision_id UUID REFERENCES decisions(id),
    description TEXT NOT NULL,
    reason TEXT,
    forecast_impact JSONB,
    actual_impact JSONB,
    margin_effect DECIMAL(12,2),
    risk_change INTEGER,
    was_correct BOOLEAN,
    outcome_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Sessions
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_creators_portfolio ON creators(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_agents_creator ON agents(creator_id);
CREATE INDEX IF NOT EXISTS idx_tasks_agent ON tasks(agent_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_decisions_status ON decisions(status);
CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status, priority);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_level ON activity_log(event_level, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_creator_date ON metrics_daily(creator_id, date DESC);
`;

async function migrate() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    console.log('Running migrations...');
    await pool.query(schema);
    console.log('Migrations complete');
    
    // Create default user if not exists
    const userCheck = await pool.query("SELECT id FROM users WHERE email = 'admin@empire.io'");
    if (userCheck.rows.length === 0) {
      // Password: admin123 (change in production!)
      const hash = '$2a$10$rQEY8vhz5K5L5J5L5J5L5O5L5J5L5J5L5J5L5J5L5J5L5J5L5J5L5';
      await pool.query(`
        INSERT INTO users (email, password_hash, name, role)
        VALUES ('admin@empire.io', $1, 'Admin', 'owner')
      `, [hash]);
      console.log('Default admin user created');
    }
    
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
