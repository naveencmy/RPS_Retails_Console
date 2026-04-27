const db = require('../config/db')

exports.insertInvoice = async (client, data, userId) => {
  const result = await client.query(`
    INSERT INTO invoices
    (invoice_number, type, party_id, subtotal, discount, tax, grand_total, created_by)
    VALUES (
      generate_invoice_number('sale'),
      'sale', $1, $2, $3, $4, $5, $6
    )
    RETURNING id, invoice_number
  `,
  [
    data.party_id,
    data.subtotal,
    data.discount,
    data.tax,
    data.total,
    userId
  ])

  return result.rows[0]
}

exports.insertInvoiceItem = async (client, invoiceId, item) => {
  await client.query(`
    INSERT INTO invoice_items
    (invoice_id, product_unit_id, quantity, rate, total)
    VALUES ($1,$2,$3,$4,$5)
  `,
  [
    invoiceId,
    item.product_unit_id,
    item.quantity,
    item.rate,
    item.total
  ])
}
  exports.getSaleById = async (id) => {
  const invoice = await db.query(`
    SELECT * FROM invoices WHERE id=$1
  `, [id])

  const items = await db.query(`
    SELECT ii.*, p.name, pu.unit_name
    FROM invoice_items ii
    JOIN product_units pu ON pu.id=ii.product_unit_id
    JOIN products p ON p.id=pu.product_id
    WHERE ii.invoice_id=$1
  `, [id])

  const payments = await db.query(`
    SELECT * FROM payments WHERE invoice_id=$1
  `, [id])

  return {
    invoice: invoice.rows[0],
    items: items.rows,
    payments: payments.rows
  }
}
exports.validateStock = async (client, items) => {
  for (const item of items) {
    const result = await client.query(`
      SELECT COALESCE(SUM(quantity),0) AS stock
      FROM stock_movements
      WHERE product_unit_id=$1
      FOR UPDATE
    `, [item.product_unit_id])

    const stock = Number(result.rows[0].stock)

    if (stock < item.quantity) {
      throw new Error(`Insufficient stock for ${item.product_unit_id}`)
    }
  }
}
/*
🔥 CRITICAL FIX: STOCK CHECK FROM MOVEMENTS
*/
exports.getAvailableStock = async (client, productUnitId) => {
  const result = await client.query(`
    SELECT COALESCE(SUM(quantity),0) AS stock
    FROM stock_movements
    WHERE product_unit_id = $1
  `,
  [productUnitId])

  return Number(result.rows[0].stock)
}

/*
🔥 ONLY WRITE OPERATION
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

exports.insertItemsAndMovements = async (
  client,
  invoiceId,
  items,
  userId
) => {
  for (const item of items) {
    await client.query(`
      INSERT INTO invoice_items
      (invoice_id, product_unit_id, quantity, rate, total)
      VALUES ($1,$2,$3,$4,$5)
    `, [
      invoiceId,
      item.product_unit_id,
      item.quantity,
      item.rate,
      item.total
    ])

    await client.query(`
      INSERT INTO stock_movements
      (product_unit_id, quantity, movement_type, reference_id, created_by)
      VALUES ($1,$2,'sale',$3,$4)
    `, [
      item.product_unit_id,
      -item.quantity,
      invoiceId,
      userId
    ])
  }
}


exports.insertPayments = async (client, invoiceId, payments) => {
  let total = 0

  for (const pay of payments) {
    await client.query(`
      INSERT INTO payments
      (invoice_id, payment_method, amount)
      VALUES ($1,$2,$3)
    `, [
      invoiceId,
      pay.method,
      pay.amount
    ])

    total += Number(pay.amount)
  }

  return total
}

exports.insertLedgerEntry = async (
  client,
  partyId,
  invoiceId,
  amount,
  type,
  description
) => {
  if (!partyId) return

  await client.query(`
    INSERT INTO ledger_entries
    (party_id, invoice_id, entry_type, amount, description)
    VALUES ($1,$2,$3,$4,$5)
  `, [partyId, invoiceId, type, amount, description])
}
exports.saveDraft = async (userId, data) => {
  const result = await db.query(`
    INSERT INTO sales_drafts (user_id, data, status)
    VALUES ($1, $2, 'open')
    RETURNING *
  `,
  [userId, data])

  return result.rows[0]
}

exports.getDrafts = async (userId) => {
  const result = await db.query(`
    SELECT * FROM sales_drafts
    WHERE user_id=$1 AND status='open'
    ORDER BY created_at DESC
  `,
  [userId])

  return result.rows
}

exports.deleteDraft = async (id) => {
  await db.query(`
    UPDATE sales_drafts SET status='closed'
    WHERE id=$1
  `, [id])
}
