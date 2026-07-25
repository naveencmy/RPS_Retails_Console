require('dotenv').config()

const app = require('./app')
const env = require('./config/env')
const db = require('./config/db')

const server = app.listen(env.PORT, () => {
  console.log(`POS Backend running on port ${env.PORT}`)
})

const shutdown = async (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`)
  server.close(async () => {
    await db.end()
    console.log('Database pool closed')
    process.exit(0)
  })

  setTimeout(() => {
    console.error('Forced shutdown')
    process.exit(1)
  }, 10000)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason)
})
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err)
  process.exit(1)
})
