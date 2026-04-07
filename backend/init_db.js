import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function initDB() {
  console.log('Initializing database schema...');

  try {
    // 1. Users Table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        avatar_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✅ Users table ready');

    // 2. Sessions Table
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(255) NOT NULL,
        domain VARCHAR(255) NOT NULL,
        difficulty VARCHAR(50) NOT NULL,
        persona VARCHAR(50) DEFAULT 'default',
        mode VARCHAR(50) DEFAULT 'chat',
        resume_url TEXT,
        resume_text TEXT,
        status VARCHAR(50) DEFAULT 'active',
        total_questions INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP WITH TIME ZONE
      );
    `;
    console.log('✅ Sessions table ready');

    // 3. Messages Table
    await sql`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
        role VARCHAR(50) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✅ Messages table ready');

    // 4. Feedback Table
    await sql`
      CREATE TABLE IF NOT EXISTS feedback (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id UUID REFERENCES sessions(id) ON DELETE CASCADE UNIQUE,
        user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
        clarity_score INTEGER NOT NULL,
        depth_score INTEGER NOT NULL,
        communication_score INTEGER NOT NULL,
        confidence_score INTEGER DEFAULT 0,
        overall_score INTEGER NOT NULL,
        strengths JSONB,
        improvements JSONB,
        career_roadmap JSONB,
        raw_feedback TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✅ Feedback table ready');

    console.log('🚀 All database tables initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

initDB();
