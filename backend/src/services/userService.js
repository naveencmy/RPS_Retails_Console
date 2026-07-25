const userRepo = require('../repositories/userRepository')
const bcrypt = require('bcrypt')

const SALT_ROUNDS = 12
const VALID_ROLES = ['owner', 'manager', 'worker', 'cashier']

exports.getUsers = () => userRepo.getAll()

exports.createUser = async (data) => {
  if (!data.username || !data.username.trim()) {
    throw Object.assign(new Error('Username is required'), { status: 400 })
  }

  if (!data.password || data.password.length < 6) {
    throw Object.assign(new Error('Password must be at least 6 characters'), { status: 400 })
  }

  const role = data.role || 'worker'
  if (!VALID_ROLES.includes(role)) {
    throw Object.assign(new Error('Invalid role: ' + role), { status: 400 })
  }

  const existing = await userRepo.findByUsername(data.username.trim())
  if (existing) {
    throw Object.assign(new Error('Username already exists'), { status: 409 })
  }

  const hash = await bcrypt.hash(data.password, SALT_ROUNDS)
  return userRepo.insert({ username: data.username.trim(), password_hash: hash, role })
}

exports.updateUser = async (id, data) => {
  if (!id) {
    throw Object.assign(new Error('User ID required'), { status: 400 })
  }

  const role = data.role
  if (!VALID_ROLES.includes(role)) {
    throw Object.assign(new Error('Invalid role: ' + role), { status: 400 })
  }

  const result = await userRepo.update(id, data)
  if (!result) {
    throw Object.assign(new Error('User not found'), { status: 404 })
  }

  return result
}

exports.toggleUser = async (id) => {
  if (!id) {
    throw Object.assign(new Error('User ID required'), { status: 400 })
  }

  await userRepo.toggleActive(id)
  return { message: 'User status toggled' }
}
