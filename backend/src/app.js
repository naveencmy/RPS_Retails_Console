const express = require('express')
const cors = require('cors')

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

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/sales', salesRoutes)
app.use('/api/purchase', purchaseRoutes)
app.use('/api/inventory', inventoryRoutes)
app.use('/api/parties', partyRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/users', userRoutes)
app.use('/api/backup', backupRoutes)

app.use(errorMiddleware)
app.get('/', (req,res)=>{
  res.json({
    service: "POS Backend",
    status: `running on ${PORT}`
  })
})
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET missing")
}
module.exports = app