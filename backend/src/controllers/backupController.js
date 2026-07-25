const { execFile } = require('child_process')
const path = require('path')
const fs = require('fs')
const os = require('os')

exports.backup = async (req, res, next) => {
  const tmpFile = path.join(os.tmpdir(), `pos_backup_${Date.now()}.sql`)
  const dbUrl = process.env.DATABASE_URL

  if (!dbUrl) {
    return res.status(500).json({ message: 'Database not configured' })
  }

  try {
    await new Promise((resolve, reject) => {
      execFile('pg_dump', ['--no-owner', '--no-privileges', '-f', tmpFile, dbUrl], { timeout: 30000 }, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })

    const stats = fs.statSync(tmpFile)
    res.json({
      message: 'Backup created',
      size: stats.size,
      filename: `pos_backup_${new Date().toISOString().slice(0, 10)}.sql`,
    })

    fs.unlink(tmpFile, () => {})
  } catch (err) {
    next(new Error('Backup failed: ' + err.message))
  }
}

exports.restore = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No backup file provided' })
  }

  const dbUrl = process.env.DATABASE_URL

  if (!dbUrl) {
    return res.status(500).json({ message: 'Database not configured' })
  }

  try {
    await new Promise((resolve, reject) => {
      execFile('psql', [dbUrl, '-f', req.file.path], { timeout: 60000 }, (err) => {
        if (err) return reject(err)
        resolve()
      })
    })

    res.json({ message: 'Database restored successfully' })
  } catch (err) {
    next(new Error('Restore failed: ' + err.message))
  }
}
