require('dotenv').config()

const app = require('./app')
const env = require('./config/env')
const logger= require('./utils/logger')

app.listen(env.PORT, () => {
  console.log(`POS Backend running on port ${env.PORT}`)
})