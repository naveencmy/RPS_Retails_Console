if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET missing")
}

module.exports = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET
}