const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: '192.168.1.233',
  database: 'betting_game',
  password: 'mypgadmin',
  port: 5432,
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

// 对赌记录 API
app.get('/api/bets', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        b.*,
        c.name as creator_name,
        o.name as opponent_name
      FROM bets b
      JOIN users c ON b.creator_id = c.id
      JOIN users o ON b.opponent_id = o.id
      ORDER BY b.created_at DESC
    `);

    // 转换数据格式以匹配前端期望
    const formattedBets = result.rows.map(bet => ({
      id: bet.id.toString(),
      title: bet.title,
      description: bet.description,
      amount: parseFloat(bet.amount),
      status: bet.status,
      winner: bet.winner_id ? (bet.winner_id === bet.creator_id ? bet.creator_name : bet.opponent_name) : undefined,
      createdAt: bet.created_at,
      dueDate: bet.due_date,
      creator: {
        name: bet.creator_name,
        prediction: bet.creator_prediction
      },
      opponent: {
        name: bet.opponent_name,
        prediction: bet.opponent_prediction
      }
    }));

    res.json(formattedBets);
  } catch (error) {
    console.error('Error fetching bets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/bets', async (req, res) => {
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
      `INSERT INTO bets (
        title, description, amount, creator_id, opponent_id,
        creator_prediction, opponent_prediction, due_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [title, description, amount, creatorId, opponentId, creator.prediction, opponent.prediction, dueDate]
    );

    // 获取完整的投注信息，包括用户名
    const betWithNames = await pool.query(`
      SELECT 
        b.*,
        c.name as creator_name,
        o.name as opponent_name
      FROM bets b
      JOIN users c ON b.creator_id = c.id
      JOIN users o ON b.opponent_id = o.id
      WHERE b.id = $1
    `, [result.rows[0].id]);

    // 转换数据格式以匹配前端期望
    const formattedBet = {
      id: betWithNames.rows[0].id.toString(),
      title: betWithNames.rows[0].title,
      description: betWithNames.rows[0].description,
      amount: parseFloat(betWithNames.rows[0].amount),
      status: betWithNames.rows[0].status,
      winner: undefined,
      createdAt: betWithNames.rows[0].created_at,
      dueDate: betWithNames.rows[0].due_date,
      creator: {
        name: betWithNames.rows[0].creator_name,
        prediction: betWithNames.rows[0].creator_prediction
      },
      opponent: {
        name: betWithNames.rows[0].opponent_name,
        prediction: betWithNames.rows[0].opponent_prediction
      }
    };

    res.json(formattedBet);
  } catch (error) {
    console.error('Error creating bet:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/bets/:id/complete', async (req, res) => {
  const { id } = req.params;
  const { winnerId } = req.body;

  try {
    // 先获取对赌信息
    const betInfo = await pool.query(`
      SELECT 
        b.*,
        c.id as creator_id,
        c.name as creator_name,
        o.id as opponent_id,
        o.name as opponent_name
      FROM bets b
      JOIN users c ON b.creator_id = c.id
      JOIN users o ON b.opponent_id = o.id
      WHERE b.id = $1
    `, [id]);

    if (betInfo.rows.length === 0) {
      return res.status(404).json({ error: '对赌记录不存在' });
    }

    const bet = betInfo.rows[0];
    // 根据胜利者名字确定对应的用户ID
    const winnerUserId = winnerId === bet.creator_name ? bet.creator_id : bet.opponent_id;

    const result = await pool.query(
      'UPDATE bets SET status = $1, winner_id = $2 WHERE id = $3 RETURNING *',
      ['completed', winnerUserId, id]
    );

    // 获取完整的投注信息，包括用户名
    const betWithNames = await pool.query(`
      SELECT 
        b.*,
        c.name as creator_name,
        o.name as opponent_name
      FROM bets b
      JOIN users c ON b.creator_id = c.id
      JOIN users o ON b.opponent_id = o.id
      WHERE b.id = $1
    `, [id]);

    // 转换数据格式以匹配前端期望
    const formattedBet = {
      id: betWithNames.rows[0].id.toString(),
      title: betWithNames.rows[0].title,
      description: betWithNames.rows[0].description,
      amount: parseFloat(betWithNames.rows[0].amount),
      status: betWithNames.rows[0].status,
      winner: betWithNames.rows[0].winner_id === betWithNames.rows[0].creator_id 
        ? betWithNames.rows[0].creator_name 
        : betWithNames.rows[0].opponent_name,
      createdAt: betWithNames.rows[0].created_at,
      dueDate: betWithNames.rows[0].due_date,
      creator: {
        name: betWithNames.rows[0].creator_name,
        prediction: betWithNames.rows[0].creator_prediction
      },
      opponent: {
        name: betWithNames.rows[0].opponent_name,
        prediction: betWithNames.rows[0].opponent_prediction
      }
    };

    res.json(formattedBet);
  } catch (error) {
    console.error('Error completing bet:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 统计 API
app.get('/api/stats', async (req, res) => {
  const { userId, startDate, endDate } = req.query;

  try {
    const result = await pool.query(`
      WITH user_bets AS (
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
        FROM bets
        WHERE (creator_id = $1 OR opponent_id = $1)
          AND status = 'completed'
          AND created_at BETWEEN $2 AND $3
      )
      SELECT
        (SELECT name FROM users WHERE id = $1) as user_name,
        COUNT(CASE WHEN outcome = 'win' THEN 1 END) as total_wins,
        COUNT(CASE WHEN outcome = 'loss' THEN 1 END) as total_losses,
        COALESCE(SUM(amount_change), 0) as net_amount
      FROM user_bets
    `, [userId, startDate, endDate]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 