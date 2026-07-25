const db = require('../config/db')
const inventoryRepo = require('../repositories/inventoryRepository')

exports.getInventory = async () => {
  return inventoryRepo.getInventory()
}

exports.getStockMovements = async () => {
  return inventoryRepo.getStockMovements()
}

exports.getLowStock = async () => {
  return inventoryRepo.getLowStock()
}

exports.adjustInventory = async (data, userId) => {
  if (!data.product_unit_id) {
    throw Object.assign(new Error('Product unit ID is required'), { status: 400 })
  }

  if (!data.quantity_change || typeof data.quantity_change !== 'number') {
    throw Object.assign(new Error('Quantity change must be a number'), { status: 400 })
  }

  const client = await db.connect()

  try {
    await client.query('BEGIN')

    await inventoryRepo.insertStockMovement(
      client,
      data.product_unit_id,
      data.quantity_change,
      'adjustment',
      null,
      userId
    )

    await client.query('COMMIT')
    return { message: 'Inventory adjusted successfully' }
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}
