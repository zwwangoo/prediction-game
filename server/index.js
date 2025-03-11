const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'prediction_game',
  password: process.env.POSTGRES_PASSWORD || 'mypgadmin',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

// 用户管理 API
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/users', async (req, res) => {
  const { name } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // unique violation
      res.status(400).json({ error: '用户名已存在' });
    } else {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// 预测记录 API
app.get('/api/predictions', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        b.*,
        c.name as creator_name,
        o.name as opponent_name
      FROM predictions b
      JOIN users c ON b.creator_id = c.id
      JOIN users o ON b.opponent_id = o.id
      ORDER BY b.created_at DESC
    `);

    // 转换数据格式以匹配前端期望
    const formattedPredictions = result.rows.map(prediction => ({
      id: prediction.id.toString(),
      title: prediction.title,
      description: prediction.description,
      amount: parseFloat(prediction.amount),
      status: prediction.status,
      winner: prediction.winner_id ? (prediction.winner_id === prediction.creator_id ? prediction.creator_name : prediction.opponent_name) : undefined,
      createdAt: prediction.created_at,
      dueDate: prediction.due_date,
      creator: {
        name: prediction.creator_name,
        prediction: prediction.creator_prediction
      },
      opponent: {
        name: prediction.opponent_name,
        prediction: prediction.opponent_prediction
      }
    }));

    res.json(formattedPredictions);
  } catch (error) {
    console.error('Error fetching predictions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/predictions', async (req, res) => {
  const {
    title,
    description,
    amount,
    creator,
    opponent,
    dueDate
  } = req.body;

  try {
    // 查找创建者和对手的用户ID
    const creatorUser = await pool.query('SELECT id FROM users WHERE name = $1', [creator.name]);
    const opponentUser = await pool.query('SELECT id FROM users WHERE name = $1', [opponent.name]);

    if (creatorUser.rows.length === 0 || opponentUser.rows.length === 0) {
      return res.status(400).json({ error: '用户不存在' });
    }

    const creatorId = creatorUser.rows[0].id;
    const opponentId = opponentUser.rows[0].id;

    const result = await pool.query(
      `INSERT INTO predictions (
        title, description, amount, creator_id, opponent_id,
        creator_prediction, opponent_prediction, due_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [title, description, amount, creatorId, opponentId, creator.prediction, opponent.prediction, dueDate]
    );

    // 获取完整的预测信息，包括用户名
    const predictionWithNames = await pool.query(`
      SELECT 
        b.*,
        c.name as creator_name,
        o.name as opponent_name
      FROM predictions b
      JOIN users c ON b.creator_id = c.id
      JOIN users o ON b.opponent_id = o.id
      WHERE b.id = $1
    `, [result.rows[0].id]);

    // 转换数据格式以匹配前端期望
    const formattedPrediction = {
      id: predictionWithNames.rows[0].id.toString(),
      title: predictionWithNames.rows[0].title,
      description: predictionWithNames.rows[0].description,
      amount: parseFloat(predictionWithNames.rows[0].amount),
      status: predictionWithNames.rows[0].status,
      winner: undefined,
      createdAt: predictionWithNames.rows[0].created_at,
      dueDate: predictionWithNames.rows[0].due_date,
      creator: {
        name: predictionWithNames.rows[0].creator_name,
        prediction: predictionWithNames.rows[0].creator_prediction
      },
      opponent: {
        name: predictionWithNames.rows[0].opponent_name,
        prediction: predictionWithNames.rows[0].opponent_prediction
      }
    };

    res.json(formattedPrediction);
  } catch (error) {
    console.error('Error creating prediction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/predictions/:id/complete', async (req, res) => {
  const { id } = req.params;
  const { winnerId } = req.body;

  try {
    // 先获取预测信息
    const predictionInfo = await pool.query(`
      SELECT 
        b.*,
        c.id as creator_id,
        c.name as creator_name,
        o.id as opponent_id,
        o.name as opponent_name
      FROM predictions b
      JOIN users c ON b.creator_id = c.id
      JOIN users o ON b.opponent_id = o.id
      WHERE b.id = $1
    `, [id]);

    if (predictionInfo.rows.length === 0) {
      return res.status(404).json({ error: '预测记录不存在' });
    }

    const prediction = predictionInfo.rows[0];
    // 根据胜利者名字确定对应的用户ID
    const winnerUserId = winnerId === prediction.creator_name ? prediction.creator_id : prediction.opponent_id;

    const result = await pool.query(
      'UPDATE predictions SET status = $1, winner_id = $2 WHERE id = $3 RETURNING *',
      ['completed', winnerUserId, id]
    );

    // 获取完整的预测信息，包括用户名
    const predictionWithNames = await pool.query(`
      SELECT 
        b.*,
        c.name as creator_name,
        o.name as opponent_name
      FROM predictions b
      JOIN users c ON b.creator_id = c.id
      JOIN users o ON b.opponent_id = o.id
      WHERE b.id = $1
    `, [id]);

    // 转换数据格式以匹配前端期望
    const formattedPrediction = {
      id: predictionWithNames.rows[0].id.toString(),
      title: predictionWithNames.rows[0].title,
      description: predictionWithNames.rows[0].description,
      amount: parseFloat(predictionWithNames.rows[0].amount),
      status: predictionWithNames.rows[0].status,
      winner: predictionWithNames.rows[0].winner_id === predictionWithNames.rows[0].creator_id 
        ? predictionWithNames.rows[0].creator_name 
        : predictionWithNames.rows[0].opponent_name,
      createdAt: predictionWithNames.rows[0].created_at,
      dueDate: predictionWithNames.rows[0].due_date,
      creator: {
        name: predictionWithNames.rows[0].creator_name,
        prediction: predictionWithNames.rows[0].creator_prediction
      },
      opponent: {
        name: predictionWithNames.rows[0].opponent_name,
        prediction: predictionWithNames.rows[0].opponent_prediction
      }
    };

    res.json(formattedPrediction);
  } catch (error) {
    console.error('Error completing prediction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 统计 API
app.get('/api/stats', async (req, res) => {
  const { userId, startDate, endDate } = req.query;

  try {
    const result = await pool.query(`
      WITH user_predictions AS (
        SELECT
          CASE
            WHEN creator_id = $1 THEN 
              CASE WHEN winner_id = creator_id THEN 'win' ELSE 'loss' END
            WHEN opponent_id = $1 THEN
              CASE WHEN winner_id = opponent_id THEN 'win' ELSE 'loss' END
          END as outcome,
          CASE
            WHEN creator_id = $1 THEN 
              CASE WHEN winner_id = creator_id THEN amount ELSE -amount END
            WHEN opponent_id = $1 THEN
              CASE WHEN winner_id = opponent_id THEN amount ELSE -amount END
          END as amount_change
        FROM predictions
        WHERE (creator_id = $1 OR opponent_id = $1)
          AND status = 'completed'
          ${startDate ? "AND created_at >= $2" : ""}
          ${endDate ? `AND created_at <= ${startDate ? "$3" : "$2"}` : ""}
      )
      SELECT
        COUNT(*) as total_predictions,
        COUNT(*) FILTER (WHERE outcome = 'win') as wins,
        COUNT(*) FILTER (WHERE outcome = 'loss') as losses,
        COALESCE(SUM(amount_change), 0) as total_profit
      FROM user_predictions
    `, [userId, startDate, endDate].filter(Boolean));

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 