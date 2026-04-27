const db = require('../config/db')

/*
TODAY SALES
*/
exports.getTodaySales = async () => {
  const result = await db.query(`
    SELECT COALESCE(SUM(grand_total),0) AS total_sales
    FROM invoices
    WHERE type='sale'
    AND created_at::date = CURRENT_DATE
  `)
  return result.rows[0]
}

/*
TODAY PURCHASE
*/
exports.getTodayPurchase = async () => {
  const result = await db.query(`
    SELECT COALESCE(SUM(grand_total),0) AS total_purchase
    FROM invoices
    WHERE type='purchase'
    AND created_at::date = CURRENT_DATE
  `)
  return result.rows[0]
}

/*
TOP PRODUCTS
*/
exports.getTopProducts = async () => {
  const result = await db.query(`
    SELECT
      p.name,
      SUM(ii.quantity) AS total_sold
    FROM invoice_items ii
    JOIN product_units pu ON pu.id = ii.product_unit_id
    JOIN products p ON p.id = pu.product_id
    JOIN invoices i ON i.id = ii.invoice_id
    WHERE i.type='sale'
    GROUP BY p.name
    ORDER BY total_sold DESC
    LIMIT 10
  `)
  return result.rows
}

/*
🔥 INVENTORY VALUE (FIXED)
*/
exports.getInventoryValue = async () => {
  const result = await db.query(`
    SELECT
      COALESCE(SUM(sm.quantity * pu.purchase_rate),0) AS stock_value
    FROM stock_movements sm
    JOIN product_units pu ON pu.id = sm.product_unit_id
  `)

  return result.rows[0]
}

/*
🔥 LOW STOCK (FIXED)
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
RECEIVABLE SUMMARY
*/
exports.getReceivableSummary = async () => {
  const result = await db.query(`
    SELECT
      p.name,
      SUM(
        CASE WHEN le.entry_type='debit'
        THEN le.amount ELSE 0 END
      ) -
      SUM(
        CASE WHEN le.entry_type='credit'
        THEN le.amount ELSE 0 END
      ) AS balance
    FROM ledger_entries le
    JOIN parties p ON p.id = le.party_id
    GROUP BY p.name
    HAVING
      SUM(
        CASE WHEN le.entry_type='debit'
        THEN le.amount ELSE 0 END
      ) -
      SUM(
        CASE WHEN le.entry_type='credit'
        THEN le.amount ELSE 0 END
      ) > 0
    ORDER BY balance DESC
  `)

  return result.rows
}

/*
TOTAL RECEIVABLES
*/
exports.getTotalReceivables = async () => {
  const result = await db.query(`
    SELECT
      COALESCE(
        SUM(
          CASE WHEN le.entry_type='debit' THEN le.amount ELSE 0 END
        ) -
        SUM(
          CASE WHEN le.entry_type='credit' THEN le.amount ELSE 0 END
        ), 0
      ) AS total_receivables
    FROM ledger_entries le
    JOIN parties p ON p.id = le.party_id
    WHERE p.type = 'customer'
  `)

  return result.rows[0]
}

/*
PAYABLES
*/
exports.getPayablesSummary = async () => {
  const result = await db.query(`
    SELECT
      COALESCE(
        SUM(
          CASE WHEN le.entry_type='credit' THEN le.amount ELSE 0 END
        ) -
        SUM(
          CASE WHEN le.entry_type='debit' THEN le.amount ELSE 0 END
        ), 0
      ) AS total_payables
    FROM ledger_entries le
    JOIN parties p ON p.id = le.party_id
    WHERE p.type = 'supplier'
  `)

  return result.rows[0]
}

/*
RECENT TRANSACTIONS
*/
exports.getRecentTransactions = async () => {
  const result = await db.query(`
    SELECT
      i.invoice_number AS invoice,
      i.type,
      COALESCE(p.name, 'Walk-in') AS party,
      i.grand_total AS amount
    FROM invoices i
    LEFT JOIN parties p ON p.id = i.party_id
    ORDER BY i.created_at DESC
    LIMIT 10
  `)

  return result.rows
}

/*
SALES REPORT
*/
exports.getSalesReport = async (from, to) => {
  const result = await db.query(`
    SELECT
      i.invoice_number,
      i.created_at,
      p.name AS customer,
      i.grand_total
    FROM invoices i
    LEFT JOIN parties p ON p.id = i.party_id
    WHERE i.type='sale'
    AND i.created_at BETWEEN $1 AND $2
    ORDER BY i.created_at DESC
  `,
  [from, to])

  return result.rows
}