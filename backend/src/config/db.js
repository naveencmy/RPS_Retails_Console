const { Pool } = require('pg')

const isProduction = process.env.NODE_ENV === 'production'
console.log("DB UPL:",process.env.DATABASE_URL)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction
    ? { rejectUnauthorized: false }
    : false
})

// TEST CONNECTION
const testConnection = async () => {
  try {
    const client = await pool.connect()
    console.log("✅ DB CONNECTED SUCCESSFULLY")

    const res = await client.query('SELECT NOW()')
    console.log("🕒 DB TIME:", res.rows[0].now)

    client.release()
  } catch (err) {
    console.error("❌ DB CONNECTION FAILED:", err.message)
  }
}

testConnection()

pool.on('error', (err) => {
  console.error('DB error', err)
})

module.exports = pool