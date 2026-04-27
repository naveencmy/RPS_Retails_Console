const db = require('../config/db')
const salesRepo = require('../repositories/salesRepository')

exports.createSale = async (data, userId) => {
  const client = await db.connect()

  try {
    await client.query("BEGIN")

    if (!data.items || data.items.length === 0) {
      throw new Error("Items required")
    }

    // 1. Validate stock (LOCK)
    await salesRepo.validateStock(client, data.items)

    // 2. Create invoice
    const invoice = await salesRepo.insertInvoice(client, data, userId)

    // 3. Items + stock movement
    await salesRepo.insertItemsAndMovements(
      client,
      invoice.id,
      data.items,
      userId
    )

    // 4. Payments
    const totalPaid = await salesRepo.insertPayments(
      client,
      invoice.id,
      data.payments || []
    )

    // 5. Ledger: SALE (DEBIT)
    await salesRepo.insertLedgerEntry(
      client,
      data.party_id,
      invoice.id,
      data.total,
      'debit',
      'Sale'
    )

    // 6. Ledger: PAYMENTS (CREDIT)
    if (totalPaid > 0) {
      await salesRepo.insertLedgerEntry(
        client,
        data.party_id,
        invoice.id,
        totalPaid,
        'credit',
        'Payment Received'
      )
    }

    await client.query("COMMIT")
    return invoice

  } catch (err) {
    await client.query("ROLLBACK")
    throw err
  } finally {
    client.release()
  }
}

exports.getSaleById = async (id) => {
  return salesRepo.getSaleById(id)
}

exports.returnSale = async (data, userId) => {
  const client = await db.connect()

  try {
    await client.query("BEGIN")

    // 1. Stock reverse
    for (const item of data.items) {
      await salesRepo.insertStockMovement(
        client,
        item.product_unit_id,
        item.quantity,
        'sale_return',
        data.invoice_id,
        userId
      )
    }

    // 2. Ledger reverse
    if (data.party_id) {
      await salesRepo.insertLedgerEntry(
        client,
        data.party_id,
        data.invoice_id,
        data.total,
        'credit',
        'Sale Return'
      )
    }

    await client.query("COMMIT")
    return { message: "Return processed" }

  } catch (err) {
    await client.query("ROLLBACK")
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