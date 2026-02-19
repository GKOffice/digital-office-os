import dotenv from 'dotenv';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const { Pool } = pg;

async function seed() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : false
  });
  
  try {
    console.log('Seeding database...');
    
    // Check if already seeded
    const userCheck = await pool.query("SELECT id FROM users WHERE email = 'admin@empire.io'");
    if (userCheck.rows.length > 0) {
      console.log('Database already seeded, skipping...');
      await pool.end();
      return;
    }
    
    // Create admin user
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    const adminId = uuidv4();
    
    await pool.query(`
      INSERT INTO users (id, email, password_hash, name, role)
      VALUES ($1, 'admin@empire.io', $2, 'Empire Admin', 'owner')
    `, [adminId, passwordHash]);
    console.log('✓ Admin user created');
    
    // Create portfolio
    const portfolioId = uuidv4();
    await pool.query(`
      INSERT INTO portfolios (id, name, owner_id, status)
      VALUES ($1, 'Digital Empire HQ', $2, 'active')
    `, [portfolioId, adminId]);
    console.log('✓ Portfolio created');
    
    // Create sample creators
    const creators = [
      { name: 'Alex Digital', brand: 'DigitalMastery', tier: 'S' },
      { name: 'Sarah Growth', brand: 'GrowthHacker Pro', tier: 'A' },
      { name: 'Mike Content', brand: 'ContentKing', tier: 'B' }
    ];
    
    for (const creator of creators) {
      const creatorId = uuidv4();
      await pool.query(`
        INSERT INTO creators (id, portfolio_id, name, brand_name, tier, status, autonomy_level)
        VALUES ($1, $2, $3, $4, $5, 'active', 1)
      `, [creatorId, portfolioId, creator.name, creator.brand, creator.tier]);
      
      // Create agents for each creator
      const agentTypes = [
        { type: 'content', name: 'Content Agent', cluster: 'content' },
        { type: 'growth', name: 'Growth Agent', cluster: 'acquisition' },
        { type: 'revenue', name: 'Revenue Agent', cluster: 'monetization' }
      ];
      
      for (const agent of agentTypes) {
        const agentId = uuidv4();
        await pool.query(`
          INSERT INTO agents (id, creator_id, agent_type, name, cluster, status, autonomy_level)
          VALUES ($1, $2, $3, $4, $5, 'active', 1)
        `, [agentId, creatorId, agent.type, agent.name, agent.cluster]);
        
        // Create sample task
        await pool.query(`
          INSERT INTO tasks (id, agent_id, creator_id, title, priority, status)
          VALUES ($1, $2, $3, $4, 'normal', 'pending')
        `, [uuidv4(), agentId, creatorId, `Initial setup for ${agent.name}`]);
      }
    }
    console.log('✓ Creators and agents created');
    
    // Create sample activity log entries
    await pool.query(`
      INSERT INTO activity_log (portfolio_id, event_type, event_level, title, description)
      VALUES 
        ($1, 'system_startup', 1, 'System Initialized', 'Digital Office OS is now online'),
        ($1, 'portfolio_created', 2, 'Portfolio Created', 'Digital Empire HQ portfolio created'),
        ($1, 'creators_imported', 3, 'Creators Imported', '3 creators imported into the system')
    `, [portfolioId]);
    console.log('✓ Activity log seeded');
    
    console.log('\n✅ Seed complete!');
    console.log(`\nLogin credentials:`);
    console.log(`  Email: admin@empire.io`);
    console.log(`  Password: ${adminPassword}`);
    
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
