const express = require('express');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database configuration
const dbConfig = {
  user: process.env.DB_USER || 'blog_user',
  host: process.env.DB_HOST || '127.0.0.1',
  database: process.env.DB_NAME || 'golden_blog',
  password: process.env.DB_PASS || 'secretpassword',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
};

let pool = null;
let dbConnected = false;

// Seed data in case database is offline or initializing
const defaultPosts = [
  {
    id: 1,
    title: "Why Golden Retrievers Are Known as the Kindest Dogs",
    author: "Elena Vance",
    date: "2026-08-28",
    category: "Temperament",
    image: "/images/hero.png",
    summary: "Golden Retrievers consistently rank as one of the most gentle, affectionate, and empathetic dog breeds in the world.",
    content: "Golden Retrievers are renowned worldwide for their gentle demeanor, intelligence, and unwavering loyalty. Bred originally in Scotland in the 19th century as hunting companions, their natural desire to please humans makes them outstanding family pets, therapy dogs, and search-and-rescue partners. Their calm patience around children and friendly attitude toward strangers earn them their title as the kindest canine companions."
  },
  {
    id: 2,
    title: "Essential Care & Happiness Tips for Your Golden Puppy",
    author: "Marcus Thorne",
    date: "2026-08-30",
    category: "Care & Puppyhood",
    image: "/images/puppy.png",
    summary: "From interactive play to proper nutrition, learn how to keep your Golden Retriever puppy healthy and thriving.",
    content: "Raising a Golden Retriever puppy requires a mix of active exercise, mental stimulation, and loving positive reinforcement. Golden puppies have high energy and an instinct to retrieve objects, so toys like tennis balls and soft frisbees keep them mentally engaged. Regular grooming of their iconic double coat prevents tangles and keeps their golden fur shiny and soft."
  },
  {
    id: 3,
    title: "Understanding the Gentle Spirit of Therapy Goldens",
    author: "Dr. Sarah Jenkins",
    date: "2026-09-01",
    category: "Therapy & Service",
    image: "/images/hero.png",
    summary: "How Golden Retrievers bring comfort to hospitals, schools, and disaster recovery areas across the globe.",
    content: "The emotional intelligence of Golden Retrievers allows them to read human mood signals with remarkable precision. In hospitals, nursing homes, and schools, therapy Goldens offer unconditional warmth. Their gentle eye contact and soft fur create an instant soothing effect, reducing stress and anxiety for everyone they interact with."
  }
];

let inMemoryComments = [
  {
    id: 1,
    post_id: 1,
    author: "David K.",
    comment: "My Golden named Cooper greets me every day with a shoe in his mouth. Truly the softest mouth and kindest heart!",
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    post_id: 2,
    author: "Aria M.",
    comment: "Great advice on the double coat grooming! Daily brushing makes a huge difference.",
    created_at: new Date().toISOString()
  }
];

async function initDatabase() {
  try {
    pool = new Pool(dbConfig);
    const client = await pool.connect();
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(100) NOT NULL,
        date VARCHAR(50) NOT NULL,
        category VARCHAR(100) NOT NULL,
        image TEXT NOT NULL,
        summary TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        post_id INT REFERENCES posts(id) ON DELETE CASCADE,
        author VARCHAR(100) NOT NULL,
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const res = await client.query('SELECT COUNT(*) FROM posts;');
    if (parseInt(res.rows[0].count, 10) === 0) {
      for (const post of defaultPosts) {
        await client.query(
          `INSERT INTO posts (title, author, date, category, image, summary, content)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [post.title, post.author, post.date, post.category, post.image, post.summary, post.content]
        );
      }
    }
    
    client.release();
    dbConnected = true;
    console.log('Successfully connected to Cloud SQL / PostgreSQL Database!');
  } catch (err) {
    console.warn('Database connection failed or not available yet. Operating in fallback mode:', err.message);
    dbConnected = false;
  }
}

initDatabase();

// Health Check Endpoint for K8s Liveness & Readiness Probes
app.get('/healthz', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    dbConnected: dbConnected
  });
});

// API Routes
app.get('/api/posts', async (req, res) => {
  if (dbConnected && pool) {
    try {
      const result = await pool.query('SELECT * FROM posts ORDER BY id ASC');
      return res.json(result.rows);
    } catch (err) {
      console.error('Error fetching posts from DB:', err.message);
    }
  }
  res.json(defaultPosts);
});

app.get('/api/comments', async (req, res) => {
  const postId = parseInt(req.query.postId || '1', 10);
  if (dbConnected && pool) {
    try {
      const result = await pool.query(
        'SELECT * FROM comments WHERE post_id = $1 ORDER BY created_at DESC',
        [postId]
      );
      return res.json(result.rows);
    } catch (err) {
      console.error('Error fetching comments from DB:', err.message);
    }
  }
  const filtered = inMemoryComments.filter(c => c.post_id === postId);
  res.json(filtered);
});

app.post('/api/comments', async (req, res) => {
  const { postId, author, comment } = req.body;
  if (!author || !comment) {
    return res.status(400).json({ error: 'Author and comment text are required.' });
  }

  const pId = parseInt(postId || '1', 10);

  if (dbConnected && pool) {
    try {
      const result = await pool.query(
        `INSERT INTO comments (post_id, author, comment) VALUES ($1, $2, $3) RETURNING *`,
        [pId, author, comment]
      );
      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('Error inserting comment to DB:', err.message);
    }
  }

  const newComment = {
    id: inMemoryComments.length + 1,
    post_id: pId,
    author: author.trim(),
    comment: comment.trim(),
    created_at: new Date().toISOString()
  };
  inMemoryComments.unshift(newComment);
  res.status(201).json(newComment);
});

app.listen(PORT, () => {
  console.log(`Golden Retriever Blog running on port ${PORT}`);
});
