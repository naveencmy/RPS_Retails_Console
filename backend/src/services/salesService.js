const db = require('../config/db')
const salesRepo = require('../repositories/salesRepository')

exports.createSale = async (data, userId) => {
  const client = await db.connect()

  try {
    await client.query('BEGIN')

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

    await salesRepo.validateStock(client, data.items)

    const invoice = await salesRepo.insertInvoice(client, data, userId)

    await salesRepo.insertItemsAndMovements(client, invoice.id, data.items, userId)

    const totalPaid = await salesRepo.insertPayments(client, invoice.id, data.payments || [])

    await salesRepo.insertLedgerEntry(client, data.party_id, invoice.id, data.total, 'debit', 'Sale')

    if (totalPaid > 0) {
      await salesRepo.insertLedgerEntry(client, data.party_id, invoice.id, totalPaid, 'credit', 'Payment Received')
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

exports.getSaleById = async (id) => {
  if (!id) {
    throw Object.assign(new Error('Sale ID required'), { status: 400 })
  }
  const sale = await salesRepo.getSaleById(id)
  if (!sale || !sale.invoice) {
    throw Object.assign(new Error('Sale not found'), { status: 404 })
  }
  return sale
}

exports.returnSale = async (data, userId) => {
  const client = await db.connect()

  try {
    await client.query('BEGIN')

    if (!data.invoice_id) {
      throw Object.assign(new Error('Original invoice ID is required for returns'), { status: 400 })
    }

    if (!data.items || data.items.length === 0) {
      throw Object.assign(new Error('At least one item is required'), { status: 400 })
    }

    const originalInvoice = await salesRepo.getSaleById(data.invoice_id)
    if (!originalInvoice || !originalInvoice.invoice) {
      throw Object.assign(new Error('Original invoice not found'), { status: 404 })
    }

    for (const item of data.items) {
      if (!item.product_unit_id || !item.quantity || item.quantity <= 0) {
        throw Object.assign(new Error('Invalid item for return'), { status: 400 })
      }

      await salesRepo.insertStockMovement(client, item.product_unit_id, item.quantity, 'sale_return', data.invoice_id, userId)
    }

    if (data.party_id) {
      await salesRepo.insertLedgerEntry(client, data.party_id, data.invoice_id, data.total, 'credit', 'Sale Return')
    }

    await client.query('COMMIT')
    return { message: 'Return processed', invoice_number: originalInvoice.invoice.invoice_number }
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

exports.saveQuickSale = async (userId, data) => {
  return salesRepo.saveDraft(userId, data)
}

exports.getQuickSales = async (userId) => {
  return salesRepo.getDrafts(userId)
}

exports.deleteQuickSale = async (id) => {
  return salesRepo.deleteDraft(id)
}
