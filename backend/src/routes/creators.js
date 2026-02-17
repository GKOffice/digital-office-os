import { Router } from 'express';
import { db } from '../db/index.js';

const router = Router();

// List creators
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM agents WHERE creator_id = c.id) as agent_count
      FROM creators c 
      ORDER BY c.current_performance_score DESC
    `);
    res.json({ creators: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list creators' });
  }
});

// Get single creator
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM creators WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Creator not found' });
    }
    
    // Get agents
    const agents = await db.query(
      'SELECT * FROM agents WHERE creator_id = $1 ORDER BY cluster, name',
      [req.params.id]
    );
    
    // Get recent activity
    const activity = await db.query(`
      SELECT * FROM activity_log 
      WHERE creator_id = $1 
      ORDER BY created_at DESC 
      LIMIT 20
    `, [req.params.id]);
    
    res.json({
      creator: result.rows[0],
      agents: agents.rows,
      activity: activity.rows
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get creator' });
  }
});

// Create creator
router.post('/', async (req, res) => {
  try {
    const { name, brandName, portfolioId } = req.body;
    
    const result = await db.query(`
      INSERT INTO creators (portfolio_id, name, brand_name)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [portfolioId, name, brandName]);
    
    const creator = result.rows[0];
    
    // Create default agents
    const agentTypes = [
      { type: 'performance_optimizer', name: 'Performance Optimizer', cluster: 'acquisition' },
      { type: 'campaign_builder', name: 'Campaign Builder', cluster: 'acquisition' },
      { type: 'creative_director', name: 'Creative Factory Director', cluster: 'acquisition' },
      { type: 'funnel_architect', name: 'Funnel Architect', cluster: 'conversion' },
      { type: 'email_director', name: 'Email & Lifecycle Director', cluster: 'conversion' },
      { type: 'offer_controller', name: 'Offer & Pricing Controller', cluster: 'monetization' },
      { type: 'ltv_director', name: 'LTV & Retention Director', cluster: 'monetization' },
      { type: 'data_integrity', name: 'Data Integrity Controller', cluster: 'governance' },
      { type: 'risk_compliance', name: 'Risk & Compliance Officer', cluster: 'governance' },
      { type: 'financial_controller', name: 'Financial Controller', cluster: 'governance' },
    ];
    
    for (const agent of agentTypes) {
      await db.query(`
        INSERT INTO agents (creator_id, agent_type, name, cluster)
        VALUES ($1, $2, $3, $4)
      `, [creator.id, agent.type, agent.name, agent.cluster]);
    }
    
    res.status(201).json({ creator });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create creator' });
  }
});

// Update autonomy level
router.put('/:id/autonomy', async (req, res) => {
  try {
    const { level } = req.body;
    
    await db.query(
      'UPDATE creators SET autonomy_level = $1, updated_at = NOW() WHERE id = $2',
      [level, req.params.id]
    );
    
    // Log activity
    await db.query(`
      INSERT INTO activity_log (creator_id, event_type, event_level, title)
      VALUES ($1, 'autonomy.level_changed', 2, $2)
    `, [req.params.id, `Autonomy level changed to L${level}`]);
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update autonomy' });
  }
});

export default router;
