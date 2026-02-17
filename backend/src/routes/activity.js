import { Router } from 'express';
import { db } from '../db/index.js';

const router = Router();

// Get activity feed
router.get('/', async (req, res) => {
  try {
    const { level, creatorId, agentId, eventType, limit = 50 } = req.query;
    
    let query = `
      SELECT al.*, 
        c.name as creator_name,
        a.name as agent_name
      FROM activity_log al
      LEFT JOIN creators c ON al.creator_id = c.id
      LEFT JOIN agents a ON al.agent_id = a.id
      WHERE 1=1
    `;
    const params = [];
    
    if (level) {
      params.push(parseInt(level));
      query += ` AND al.event_level <= $${params.length}`;
    }
    if (creatorId) {
      params.push(creatorId);
      query += ` AND al.creator_id = $${params.length}`;
    }
    if (agentId) {
      params.push(agentId);
      query += ` AND al.agent_id = $${params.length}`;
    }
    if (eventType) {
      params.push(eventType);
      query += ` AND al.event_type = $${params.length}`;
    }
    
    params.push(parseInt(limit));
    query += ` ORDER BY al.created_at DESC LIMIT $${params.length}`;
    
    const result = await db.query(query, params);
    
    // Calculate signal-to-noise
    const counts = await db.query(`
      SELECT 
        COUNT(*) FILTER (WHERE event_level <= 2) as signal,
        COUNT(*) FILTER (WHERE event_level > 2) as noise
      FROM activity_log
      WHERE created_at > NOW() - INTERVAL '24 hours'
    `);
    
    const snr = counts.rows[0];
    const ratio = parseInt(snr.signal) / Math.max(parseInt(snr.noise), 1);
    
    res.json({
      activity: result.rows,
      signalMetrics: {
        level1: parseInt(snr.signal),
        level2: 0, // would need separate query
        ratio: ratio.toFixed(2),
        rating: ratio > 0.3 ? 'HIGH_NOISE' : ratio > 0.1 ? 'MODERATE' : 'GOOD'
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get activity' });
  }
});

// Get daily digest
router.get('/digest', async (req, res) => {
  try {
    // Critical alerts (Level 1-2)
    const critical = await db.query(`
      SELECT * FROM activity_log
      WHERE event_level <= 2
      AND created_at > NOW() - INTERVAL '24 hours'
      ORDER BY created_at DESC
      LIMIT 10
    `);
    
    // Activity summary
    const summary = await db.query(`
      SELECT 
        COUNT(*) FILTER (WHERE event_type LIKE 'decision.%') as decisions,
        COUNT(*) FILTER (WHERE event_type LIKE 'api.%executed') as executions,
        COUNT(*) FILTER (WHERE event_type = 'rollback.completed') as rollbacks,
        COUNT(*) FILTER (WHERE event_type LIKE 'error.%') as errors
      FROM activity_log
      WHERE created_at > NOW() - INTERVAL '24 hours'
    `);
    
    res.json({
      date: new Date().toISOString().split('T')[0],
      critical: critical.rows,
      summary: summary.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get digest' });
  }
});

// Create activity entry
router.post('/', async (req, res) => {
  try {
    const { 
      portfolioId, creatorId, agentId, eventType, eventLevel,
      entityType, entityId, title, description,
      beforeState, afterState, justification,
      riskAssessment, marginImpact, cashImpact
    } = req.body;
    
    const result = await db.query(`
      INSERT INTO activity_log (
        portfolio_id, creator_id, agent_id, event_type, event_level,
        entity_type, entity_id, title, description,
        before_state, after_state, justification,
        risk_assessment, margin_impact, cash_impact
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `, [
      portfolioId, creatorId, agentId, eventType, eventLevel,
      entityType, entityId, title, description,
      beforeState, afterState, justification,
      riskAssessment, marginImpact, cashImpact
    ]);
    
    res.status(201).json({ entry: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

export default router;
