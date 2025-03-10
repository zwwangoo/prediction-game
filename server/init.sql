CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bets (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  creator_id INTEGER REFERENCES users(id) NOT NULL,
  opponent_id INTEGER REFERENCES users(id) NOT NULL,
  creator_prediction TEXT NOT NULL,
  opponent_prediction TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' NOT NULL,
  winner_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  due_date TIMESTAMP WITH TIME ZONE,
  CONSTRAINT different_users CHECK (creator_id != opponent_id)
); 