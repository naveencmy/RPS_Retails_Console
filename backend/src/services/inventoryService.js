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

/*
PROPER ADJUSTMENT = STOCK MOVEMENT
*/
exports.adjustInventory = async (data, userId) => {
  const client = await db.connect()

  try {
    await client.query("BEGIN")

    await inventoryRepo.insertStockMovement(
      client,
      data.product_unit_id,
      data.quantity_change,
      'adjustment',
      null,
      userId
    )

    await client.query("COMMIT")

    return {
      message: "Inventory adjusted successfully"
    }

  } catch (err) {
    await client.query("ROLLBACK")
    throw err
  } finally {
    client.release()
  }
}