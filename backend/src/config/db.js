const { Pool } = require('pg')

const isProduction = process.env.NODE_ENV === 'production'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction
    ? { rejectUnauthorized: false }
    : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

const testConnection = async () => {
  try {
    const client = await pool.connect()
    console.log('DB CONNECTED')
    const res = await client.query('SELECT NOW()')
    console.log('DB TIME:', res.rows[0].now)
    client.release()
  } catch (err) {
    console.error('DB CONNECTION FAILED:', err.message)
  }
}

testConnection()

pool.on('error', (err) => {
  console.error('DB pool error:', err.message)
})

module.exports = pool
