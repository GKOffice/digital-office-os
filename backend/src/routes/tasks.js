import { Router } from 'express';
import { db } from '../db/index.js';

const router = Router();

// List tasks
router.get('/', async (req, res) => {
  try {
    const { status, agentId, creatorId } = req.query;
    
    let query = 'SELECT t.*, a.name as agent_name FROM tasks t LEFT JOIN agents a ON t.agent_id = a.id WHERE 1=1';
    const params = [];
    
    if (status) {
      params.push(status);
      query += ` AND t.status = $${params.length}`;
    }
    if (agentId) {
      params.push(agentId);
      query += ` AND t.agent_id = $${params.length}`;
    }
    if (creatorId) {
      params.push(creatorId);
      query += ` AND t.creator_id = $${params.length}`;
    }
    
    query += ' ORDER BY created_at DESC LIMIT 50';
    
    const result = await db.query(query, params);
    res.json({ tasks: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to list tasks' });
  }
});

// Create task
router.post('/', async (req, res) => {
  try {
    const { agentId, creatorId, title, description, priority } = req.body;
    
    const result = await db.query(`
      INSERT INTO tasks (agent_id, creator_id, title, description, priority)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [agentId, creatorId, title, description, priority || 'normal']);
    
    // Log activity
    await db.query(`
      INSERT INTO activity_log (creator_id, agent_id, event_type, event_level, title)
      VALUES ($1, $2, 'task.created', 4, $3)
    `, [creatorId, agentId, `Task created: ${title}`]);
    
    res.status(201).json({ task: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    const updateFields = { status };
    if (status === 'in_progress') updateFields.started_at = 'NOW()';
    if (status === 'completed') updateFields.completed_at = 'NOW()';
    
    await db.query(
      `UPDATE tasks SET status = $1, updated_at = NOW() WHERE id = $2`,
      [status, req.params.id]
    );
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

export default router;
