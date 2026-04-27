const db = require('../config/db')

exports.getAll = async () => {
  const result = await db.query(`
    SELECT
      p.id,
      p.name,
      p.sku,
      p.category,
      p.reorder_level,

      pu.id AS unit_id,
      pu.unit_name,
      pu.barcode,
      pu.mrp,
      pu.purchase_rate,
      pu.sales_rate,
      pu.gst_percent,
      pu.updated_at

    FROM products p
    JOIN product_units pu ON pu.product_id = p.id
    ORDER BY p.name
  `)

  return result.rows
}

exports.search = async (term) => {
  const result = await db.query(`
    SELECT
      p.id,
      p.name,
      pu.id AS unit_id,
      pu.barcode,
      pu.sales_rate,
      pu.unit_name
    FROM products p
    JOIN product_units pu ON pu.product_id = p.id
    WHERE p.name ILIKE $1 OR pu.barcode = $2
    LIMIT 20
  `,
  [`%${term}%`, term])

  return result.rows
}

exports.getByBarcode = async (barcode) => {
  const result = await db.query(`
    SELECT
      p.id,
      p.name,
      pu.id AS unit_id,
      pu.unit_name,
      pu.sales_rate,
      pu.purchase_rate,
      pu.mrp,
      pu.gst_percent,
      pu.barcode
    FROM product_units pu
    JOIN products p ON p.id = pu.product_id
    WHERE pu.barcode = $1
  `,
  [barcode])

  return result.rows[0]
}

exports.insertProduct = async (client, data) => {
  const result = await client.query(`
    INSERT INTO products
    (name, sku, category, reorder_level)
    VALUES ($1,$2,$3,$4)
    RETURNING *
  `,
  [
    data.name,
    data.sku,
    data.category,
    data.reorder_level || 0
  ])

  return result.rows[0]
}

exports.insertUnit = async (client, productId, unit, userId) => {
  await client.query(`
    INSERT INTO product_units
    (
      product_id,
      unit_name,
      conversion_factor,
      barcode,
      mrp,
      purchase_rate,
      sales_rate,
      gst_percent,
      updated_by
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
  `,
  [
    productId,
    unit.unit_name,
    unit.conversion_factor,
    unit.barcode,
    unit.mrp,
    unit.purchase_rate,
    unit.sales_rate,
    unit.gst_percent,
    userId
  ])
}

exports.updateProduct = async (client, id, data) => {
  await client.query(`
    UPDATE products
    SET
      name=$1,
      sku=$2,
      category=$3,
      reorder_level=$4
    WHERE id=$5
  `,
  [
    data.name,
    data.sku,
    data.category,
    data.reorder_level,
    id
  ])
}

exports.updateUnit = async (client, unitId, unit, userId) => {
  await client.query(`
    UPDATE product_units
    SET
      unit_name=$1,
      barcode=$2,
      mrp=$3,
      purchase_rate=$4,
      sales_rate=$5,
      gst_percent=$6,
      updated_at = NOW(),
      updated_by = $7
    WHERE id=$8
  `,
  [
    unit.unit_name,
    unit.barcode,
    unit.mrp,
    unit.purchase_rate,
    unit.sales_rate,
    unit.gst_percent,
    userId,
    unitId
  ])
}

exports.deleteProduct = async (id) => {
  await db.query(`DELETE FROM products WHERE id=$1`, [id])
}