import { Router } from 'express';
import { db } from '../db/index.js';

const router = Router();

// Get portfolio summary
router.get('/', async (req, res) => {
  try {
    // Get or create default portfolio
    let result = await db.query('SELECT * FROM portfolios LIMIT 1');
    
    if (result.rows.length === 0) {
      // Create default portfolio
      result = await db.query(
        'INSERT INTO portfolios (name, owner_id) VALUES ($1, $2) RETURNING *',
        ['Main Portfolio', req.user.userId]
      );
    }
    
    const portfolio = result.rows[0];
    
    // Get creator count
    const creatorCount = await db.query(
      'SELECT COUNT(*) as count FROM creators WHERE portfolio_id = $1',
      [portfolio.id]
    );
    
    // Get aggregated metrics (mock for now)
    const metrics = {
      totalRevenue: 47832,
      revenueChange: 12,
      roas: 2.4,
      roasChange: 0.3,
      cpa: 78,
      cpaChange: -5,
      ltvCac: 3.2,
      ltvCacChange: 0.4,
      riskIndex: 34,
      riskChange: -6
    };
    
    res.json({
      portfolio,
      creatorCount: parseInt(creatorCount.rows[0].count),
      metrics
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get portfolio' });
  }
});

// Get allocation
router.get('/allocation', async (req, res) => {
  try {
    const creators = await db.query(`
      SELECT id, name, tier, current_performance_score, current_risk_index 
      FROM creators 
      ORDER BY current_performance_score DESC
    `);
    
    res.json({ allocation: creators.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get allocation' });
  }
});

export default router;
