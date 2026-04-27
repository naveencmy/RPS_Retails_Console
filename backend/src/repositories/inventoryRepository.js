const db = require('../config/db')

/*
SOURCE OF TRUTH = stock_movements
*/

exports.getInventory = async () => {
  const result = await db.query(`
    SELECT
      pu.id AS product_unit_id,
      p.name,
      pu.unit_name,
      COALESCE(SUM(sm.quantity), 0) AS quantity,
      pu.purchase_rate,
      COALESCE(SUM(sm.quantity), 0) * pu.purchase_rate AS stock_value
    FROM product_units pu
    JOIN products p ON p.id = pu.product_id
    LEFT JOIN stock_movements sm
      ON sm.product_unit_id = pu.id
    GROUP BY pu.id, p.name, pu.unit_name, pu.purchase_rate
    ORDER BY p.name
  `)

  return result.rows
}

exports.getStockMovements = async () => {
  const result = await db.query(`
    SELECT
      sm.id,
      p.name,
      pu.unit_name,
      sm.quantity,
      sm.movement_type,
      sm.reference_id,
      sm.created_at
    FROM stock_movements sm
    JOIN product_units pu
      ON pu.id = sm.product_unit_id
    JOIN products p
      ON p.id = pu.product_id
    ORDER BY sm.created_at DESC
    LIMIT 200
  `)

  return result.rows
}

/*
KEEP FUNCTION — but FIX SOURCE
*/
exports.getLowStock = async () => {
  const result = await db.query(`
    SELECT
      p.name,
      pu.unit_name,
      COALESCE(SUM(sm.quantity),0) AS quantity,
      p.reorder_level
    FROM product_units pu
    JOIN products p ON p.id = pu.product_id
    LEFT JOIN stock_movements sm
      ON sm.product_unit_id = pu.id
    GROUP BY p.name, pu.unit_name, p.reorder_level
    HAVING COALESCE(SUM(sm.quantity),0) <= p.reorder_level
    ORDER BY quantity ASC
  `)

  return result.rows
}

/*
ONLY VALID WRITE OPERATION
*/
exports.insertStockMovement = async (
  client,
  productUnitId,
  qty,
  type,
  reference,
  userId
) => {
  await client.query(`
    INSERT INTO stock_movements
    (product_unit_id, quantity, movement_type, reference_id, created_by)
    VALUES ($1,$2,$3,$4,$5)
  `,
  [productUnitId, qty, type, reference, userId])
}