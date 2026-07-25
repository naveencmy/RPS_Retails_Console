const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

const authRoutes = require('./routes/authRoutes')
const productRoutes = require('./routes/productRoutes')
const salesRoutes = require('./routes/salesRoutes')
const purchaseRoutes = require('./routes/purchaseRoutes')
const inventoryRoutes = require('./routes/inventoryRoutes')
const partyRoutes = require('./routes/partyRoutes')
const reportRoutes = require('./routes/reportRoutes')
const userRoutes = require('./routes/userRoutes')
const backupRoutes = require('./routes/backupRoutes')

const errorMiddleware = require('./middleware/errorMiddleware')
const { PORT } = require('./config/env')

const app = express()

// ── SECURITY HEADERS ──────────────────────────────────────────────
app.use(helmet())

// ── CORS ──────────────────────────────────────────────────────────
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:8080', 'http://localhost:3000']

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}))

// ── RATE LIMITING ─────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many attempts, try again later' },
  standardHeaders: true,
  legacyHeaders: false,
})

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 200,
  message: { message: 'Rate limit exceeded' },
  standardHeaders: true,
  legacyHeaders: false,
})

// ── BODY PARSING ──────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }))

// ── ROUTES ────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/products', apiLimiter, productRoutes)
app.use('/api/sales', apiLimiter, salesRoutes)
app.use('/api/purchase', apiLimiter, purchaseRoutes)
app.use('/api/inventory', apiLimiter, inventoryRoutes)
app.use('/api/parties', apiLimiter, partyRoutes)
app.use('/api/reports', apiLimiter, reportRoutes)
app.use('/api/users', apiLimiter, userRoutes)
app.use('/api/backup', apiLimiter, backupRoutes)

// ── HEALTH CHECK ──────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── SYSTEM INFO ──────────────────────────────────────────────────
const pool = require('./config/db')

app.get('/api/system', async (req, res) => {
  const startTime = Date.now()
  let dbStatus = 'optimal'
  let dbLatency = 0

  try {
    const t0 = Date.now()
    await pool.query('SELECT 1')
    dbLatency = Date.now() - t0
  } catch {
    dbStatus = 'error'
  }

  const uptimeSeconds = Math.floor(process.uptime())
  const days = Math.floor(uptimeSeconds / 86400)
  const hours = Math.floor((uptimeSeconds % 86400) / 3600)
  const minutes = Math.floor((uptimeSeconds % 3600) / 60)

  let productCount = 0
  let partyCount = 0
  let lowStockCount = 0
  let todaySales = 0
  let todayPurchases = 0

  try {
    const [products, parties, lowStock, sales, purchases] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS count FROM products'),
      pool.query('SELECT COUNT(*)::int AS count FROM parties'),
      pool.query(`SELECT COUNT(*)::int FROM (
        SELECT p.id, COALESCE(SUM(sm.quantity),0) AS quantity
        FROM products p
        JOIN product_units pu ON pu.product_id = p.id
        LEFT JOIN stock_movements sm ON sm.product_unit_id = pu.id
        GROUP BY p.id, p.reorder_level
        HAVING COALESCE(SUM(sm.quantity),0) <= p.reorder_level
      ) low`),
      pool.query(`SELECT COUNT(*)::int AS count FROM invoices WHERE type='sale' AND DATE(created_at)=CURRENT_DATE`),
      pool.query(`SELECT COUNT(*)::int AS count FROM invoices WHERE type='purchase' AND DATE(created_at)=CURRENT_DATE`),
    ])
    productCount = products.rows[0].count
    partyCount = parties.rows[0].count
    lowStockCount = lowStock.rows[0].count
    todaySales = sales.rows[0].count
    todayPurchases = purchases.rows[0].count
  } catch { /* ignore partial failures */ }

  const mem = process.memoryUsage()

  res.json({
    uptime: { days, hours, minutes, total_seconds: uptimeSeconds },
    db: { status: dbStatus, latency_ms: dbLatency },
    counts: { products: productCount, parties: partyCount, low_stock: lowStockCount, today_sales: todaySales, today_purchases: todayPurchases },
    memory: { used_mb: Math.round(mem.heapUsed / 1024 / 1024), total_mb: Math.round(mem.heapTotal / 1024 / 1024) },
    server_started: new Date(Date.now() - process.uptime() * 1000).toISOString(),
  })
})

// ── ERROR HANDLER ─────────────────────────────────────────────────
app.use(errorMiddleware)

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET missing')
}

module.exports = app
