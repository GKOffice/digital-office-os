import dotenv from 'dotenv';
import pg from 'pg';
import bcrypt from 'bcryptjs';

dotenv.config();

const { Pool } = pg;

async function seed() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('Seeding database...');

    // Create admin user
    const passwordHash = await bcrypt.hash('admin123', 10);
    const userResult = await pool.query(`
      INSERT INTO users (email, password_hash, name, role)
      VALUES ('admin@empire.io', $1, 'Admin', 'owner')
      ON CONFLICT (email) DO UPDATE SET password_hash = $1
      RETURNING id
    `, [passwordHash]);
    const userId = userResult.rows[0].id;
    console.log('Created admin user:', userId);

    // Create portfolio
    const portfolioResult = await pool.query(`
      INSERT INTO portfolios (name, owner_id)
      VALUES ('Main Portfolio', $1)
      ON CONFLICT DO NOTHING
      RETURNING id
    `, [userId]);
    
    let portfolioId;
    if (portfolioResult.rows.length > 0) {
      portfolioId = portfolioResult.rows[0].id;
    } else {
      const existing = await pool.query('SELECT id FROM portfolios LIMIT 1');
      portfolioId = existing.rows[0].id;
    }
    console.log('Portfolio ID:', portfolioId);

    // Create sample creator
    const creatorResult = await pool.query(`
      INSERT INTO creators (portfolio_id, name, brand_name, tier, autonomy_level, current_risk_index, current_data_confidence, current_performance_score)
      VALUES ($1, 'Creator A', 'Brand A', 'S', 2, 28, 87, 85)
      RETURNING id
    `, [portfolioId]);
    const creatorId = creatorResult.rows[0].id;
    console.log('Created Creator A:', creatorId);

    // Create agents for Creator A
    const agents = [
      { type: 'performance_optimizer', name: 'Performance Optimizer', cluster: 'acquisition', kpis: ['ROAS', 'CPA', 'Spend'] },
      { type: 'campaign_builder', name: 'Campaign Builder', cluster: 'acquisition', kpis: ['Campaign Health', 'Setup Accuracy'] },
      { type: 'creative_director', name: 'Creative Factory Director', cluster: 'acquisition', kpis: ['Creative Win Rate', 'Thumb-Stop Rate'] },
      { type: 'funnel_architect', name: 'Funnel Architect', cluster: 'conversion', kpis: ['Page CVR', 'Checkout CVR'] },
      { type: 'email_director', name: 'Email & Lifecycle Director', cluster: 'conversion', kpis: ['Open Rate', 'Click Rate', 'Email CVR'] },
      { type: 'offer_controller', name: 'Offer & Pricing Controller', cluster: 'monetization', kpis: ['AOV', 'Take Rate'] },
      { type: 'ltv_director', name: 'LTV & Retention Director', cluster: 'monetization', kpis: ['LTV', 'LTV/CAC', 'Churn Rate'] },
      { type: 'data_integrity', name: 'Data Integrity Controller', cluster: 'governance', kpis: ['Data Confidence', 'Pixel Match Rate'] },
      { type: 'risk_compliance', name: 'Risk & Compliance Officer', cluster: 'governance', kpis: ['Risk Index', 'Compliance Score'] },
      { type: 'financial_controller', name: 'Financial Controller', cluster: 'governance', kpis: ['Margin', 'Refund Rate', 'Cash Runway'] },
    ];

    for (const agent of agents) {
      const agentResult = await pool.query(`
        INSERT INTO agents (creator_id, agent_type, name, cluster, autonomy_level, accuracy_score, sla_adherence, kpis_owned)
        VALUES ($1, $2, $3, $4, 2, 94.5, 98.0, $5)
        RETURNING id
      `, [creatorId, agent.type, agent.name, agent.cluster, agent.kpis]);
      console.log(`Created agent: ${agent.name}`);
      
      // Create sample task for first agent
      if (agent.type === 'performance_optimizer') {
        await pool.query(`
          INSERT INTO tasks (agent_id, creator_id, title, description, priority, status)
          VALUES ($1, $2, 'Review CPA spike on Ad Set 12', 'CPA increased 35% in last 4 hours', 'critical', 'pending')
        `, [agentResult.rows[0].id, creatorId]);
        
        await pool.query(`
          INSERT INTO tasks (agent_id, creator_id, title, description, priority, status)
          VALUES ($1, $2, 'Scale winner ad sets', 'Ad sets 3, 7, 9 meeting scale criteria', 'high', 'pending')
        `, [agentResult.rows[0].id, creatorId]);
        console.log('Created sample tasks');
      }
    }

    // Create sample activity log entries
    const activities = [
      { type: 'decision.executed', level: 3, title: 'Budget scaled: Ad Set "Cold-Interest" $500→$600 (+20%)', description: 'ROAS 2.8, CPA $72, Confidence 87%' },
      { type: 'task.completed', level: 3, title: 'Daily performance review completed', description: null },
      { type: 'kpi.threshold_breach', level: 2, title: 'CPA spike detected on Ad Set 12', description: 'CPA increased from $72 to $97' },
      { type: 'decision.proposed', level: 3, title: 'Proposed: Pause Ad Set 15 (ROAS 0.6)', description: 'Below kill threshold' },
    ];

    for (const act of activities) {
      await pool.query(`
        INSERT INTO activity_log (portfolio_id, creator_id, event_type, event_level, title, description)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [portfolioId, creatorId, act.type, act.level, act.title, act.description]);
    }
    console.log('Created sample activity entries');

    // Create sample decision needing approval
    const decisionResult = await pool.query(`
      INSERT INTO decisions (creator_id, decision_type, inputs, decision, projected_impact, status, requires_approval)
      VALUES ($1, 'scale_budget', $2, 'Scale budget +25%: $500/day → $625/day', $3, 'pending', true)
      RETURNING id
    `, [
      creatorId,
      JSON.stringify({ metrics: { roas_7d: 2.8, cpa_7d: 72, data_confidence: 87, risk_index: 28 } }),
      JSON.stringify({ revenue: '+$875/week', margin: '+$367', risk_change: '+2' })
    ]);

    await pool.query(`
      INSERT INTO approvals (decision_id, priority, status)
      VALUES ($1, 'high', 'pending')
    `, [decisionResult.rows[0].id]);
    console.log('Created sample approval');

    console.log('Seed complete!');
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
