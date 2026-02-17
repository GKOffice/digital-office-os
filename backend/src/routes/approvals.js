import { Router } from 'express';
import { db } from '../db/index.js';

const router = Router();

// List pending approvals
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        a.*,
        d.decision_type,
        d.decision,
        d.inputs,
        d.action_plan,
        d.projected_impact,
        d.agent_id,
        ag.name as agent_name,
        c.name as creator_name
      FROM approvals a
      JOIN decisions d ON a.decision_id = d.id
      LEFT JOIN agents ag ON d.agent_id = ag.id
      LEFT JOIN creators c ON d.creator_id = c.id
      WHERE a.status = 'pending'
      ORDER BY 
        CASE a.priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 ELSE 3 END,
        a.created_at ASC
    `);
    
    res.json({ approvals: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list approvals' });
  }
});

// Get single approval
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        a.*,
        d.*,
        ag.name as agent_name,
        c.name as creator_name
      FROM approvals a
      JOIN decisions d ON a.decision_id = d.id
      LEFT JOIN agents ag ON d.agent_id = ag.id
      LEFT JOIN creators c ON d.creator_id = c.id
      WHERE a.id = $1
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Approval not found' });
    }
    
    res.json({ approval: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get approval' });
  }
});

// Approve
router.post('/:id/approve', async (req, res) => {
  try {
    const { comment } = req.body;
    
    // Update approval
    await db.query(`
      UPDATE approvals 
      SET status = 'approved', 
          reviewed_by = $1, 
          reviewed_at = NOW(),
          action = 'approved',
          comment = $2
      WHERE id = $3
    `, [req.user.userId, comment, req.params.id]);
    
    // Get decision and update
    const approval = await db.query('SELECT decision_id FROM approvals WHERE id = $1', [req.params.id]);
    const decisionId = approval.rows[0].decision_id;
    
    await db.query(`
      UPDATE decisions 
      SET status = 'approved', 
          approved_by = $1, 
          approved_at = NOW()
      WHERE id = $2
    `, [req.user.userId, decisionId]);
    
    // Log owner action
    await db.query(`
      INSERT INTO owner_actions (user_id, action_type, target_type, target_id, description)
      VALUES ($1, 'approval', 'decision', $2, 'Approved decision')
    `, [req.user.userId, decisionId]);
    
    // Log activity
    await db.query(`
      INSERT INTO activity_log (event_type, event_level, title, decision_id)
      VALUES ('decision.approved', 3, 'Decision approved by owner', $1)
    `, [decisionId]);
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve' });
  }
});

// Reject
router.post('/:id/reject', async (req, res) => {
  try {
    const { comment } = req.body;
    
    await db.query(`
      UPDATE approvals 
      SET status = 'rejected', 
          reviewed_by = $1, 
          reviewed_at = NOW(),
          action = 'rejected',
          comment = $2
      WHERE id = $3
    `, [req.user.userId, comment, req.params.id]);
    
    const approval = await db.query('SELECT decision_id FROM approvals WHERE id = $1', [req.params.id]);
    const decisionId = approval.rows[0].decision_id;
    
    await db.query(`
      UPDATE decisions SET status = 'rejected' WHERE id = $1
    `, [decisionId]);
    
    // Log owner action
    await db.query(`
      INSERT INTO owner_actions (user_id, action_type, target_type, target_id, description, reason)
      VALUES ($1, 'rejection', 'decision', $2, 'Rejected decision', $3)
    `, [req.user.userId, decisionId, comment]);
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject' });
  }
});

export default router;
