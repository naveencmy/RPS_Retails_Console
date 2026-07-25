const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const userRepo = require('../repositories/userRepository')
const env = require('../config/env')

const SALT_ROUNDS = 12

exports.login = async (username, password) => {
  if (!username || !password) {
    throw Object.assign(new Error('Username and password required'), { status: 400 })
  }

  const user = await userRepo.findByUsername(username)
  if (!user) {
    throw Object.assign(new Error('Invalid credentials'), { status: 401 })
  }

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) {
    throw Object.assign(new Error('Invalid credentials'), { status: 401 })
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    env.JWT_SECRET,
    { expiresIn: '12h', issuer: 'pos-backend' }
  )

  return {
    token,
    user: { id: user.id, name: user.username, role: user.role },
  }
}

exports.changePassword = async (userId, current, newPass) => {
  if (!current || !newPass) {
    throw Object.assign(new Error('Current and new password required'), { status: 400 })
  }

  if (newPass.length < 6) {
    throw Object.assign(new Error('New password must be at least 6 characters'), { status: 400 })
  }

  const user = await userRepo.findById(userId)
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 })
  }

  const valid = await bcrypt.compare(current, user.password_hash)
  if (!valid) {
    throw Object.assign(new Error('Wrong password'), { status: 401 })
  }

  const hash = await bcrypt.hash(newPass, SALT_ROUNDS)
  await userRepo.updatePassword(userId, hash)

  return { message: 'Password updated' }
}
