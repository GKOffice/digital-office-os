import { Router } from 'express';
import { db } from '../db/index.js';

const router = Router();

// Get single agent
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM agents WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    const agent = result.rows[0];
    
    // Get tasks
    const tasks = await db.query(`
      SELECT * FROM tasks 
      WHERE agent_id = $1 
      ORDER BY 
        CASE priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'normal' THEN 3 ELSE 4 END,
        created_at DESC
      LIMIT 20
    `, [req.params.id]);
    
    // Get decisions
    const decisions = await db.query(`
      SELECT * FROM decisions 
      WHERE agent_id = $1 
      ORDER BY created_at DESC 
      LIMIT 20
    `, [req.params.id]);
    
    // Get activity
    const activity = await db.query(`
      SELECT * FROM activity_log 
      WHERE agent_id = $1 
      ORDER BY created_at DESC 
      LIMIT 30
    `, [req.params.id]);
    
    res.json({
      agent,
      tasks: tasks.rows,
      decisions: decisions.rows,
      activity: activity.rows
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get agent' });
  }
});

// Update agent autonomy
router.put('/:id/autonomy', async (req, res) => {
  try {
    const { level } = req.body;
    
    await db.query(
      'UPDATE agents SET autonomy_level = $1, updated_at = NOW() WHERE id = $2',
      [level, req.params.id]
    );
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update autonomy' });
  }
});

export default router;
