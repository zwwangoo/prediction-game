const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: '192.168.1.233',
  database: 'betting_game',
  password: 'mypgadmin',
  port: 5432,
});

async function cleanDatabase() {
  try {
    await pool.query('TRUNCATE bets, users RESTART IDENTITY CASCADE;');
    console.log('Successfully cleaned the database');
  } catch (error) {
    console.error('Error cleaning database:', error);
  } finally {
    await pool.end();
  }
}

cleanDatabase(); 