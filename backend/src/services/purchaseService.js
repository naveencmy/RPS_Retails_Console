const db = require('../config/db')
const purchaseRepo = require('../repositories/purchaseRepository')

exports.createPurchase = async (data, userId) => {
  const client = await db.connect()

  try {
    await client.query('BEGIN')

    if (!data.party_id) {
      throw Object.assign(new Error('Supplier is required'), { status: 400 })
    }

    if (!data.items || data.items.length === 0) {
      throw Object.assign(new Error('At least one item is required'), { status: 400 })
    }

    if (!data.total || data.total <= 0) {
      throw Object.assign(new Error('Total must be greater than 0'), { status: 400 })
    }

    for (const item of data.items) {
      if (!item.product_unit_id || !item.quantity || item.quantity <= 0) {
        throw Object.assign(new Error('Invalid item: product_unit_id and positive quantity required'), { status: 400 })
      }
      if (!item.rate || item.rate < 0) {
        throw Object.assign(new Error('Invalid item: rate must be non-negative'), { status: 400 })
      }
    }

    const invoice = await purchaseRepo.insertPurchaseInvoice(client, data, userId)
    const invoiceId = invoice.id

    for (const item of data.items) {
      await purchaseRepo.insertPurchaseItem(client, invoiceId, item)
      await purchaseRepo.insertStockMovement(client, item.product_unit_id, item.quantity, 'purchase', invoiceId, userId)
    }

    for (const pay of data.payments || []) {
      await purchaseRepo.insertPayment(client, invoiceId, pay)
    }

    await client.query('COMMIT')
    return invoice
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

exports.getPurchaseById = async (id) => {
  if (!id) {
    throw Object.assign(new Error('Purchase ID required'), { status: 400 })
  }
  const purchase = await purchaseRepo.getPurchaseById(id)
  if (!purchase) {
    throw Object.assign(new Error('Purchase not found'), { status: 404 })
  }
  return purchase
}
