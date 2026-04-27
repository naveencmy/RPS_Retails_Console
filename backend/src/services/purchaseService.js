const db = require('../config/db')
const purchaseRepo = require('../repositories/purchaseRepository')

exports.createPurchase = async (data, userId) => {
  const client = await db.connect()

  try {
    await client.query("BEGIN")

    // 🔥 STEP 1: CREATE INVOICE
    const invoice = await purchaseRepo.insertPurchaseInvoice(
      client,
      data,
      userId
    )

    const invoiceId = invoice.id

    // 🔥 STEP 2: INSERT ITEMS + STOCK IN
    for (const item of data.items) {
      await purchaseRepo.insertPurchaseItem(
        client,
        invoiceId,
        item
      )

      await purchaseRepo.insertStockMovement(
        client,
        item.product_unit_id,
        item.quantity,        // POSITIVE
        'purchase',
        invoiceId,
        userId
      )
    }

    // 🔥 STEP 3: PAYMENTS
    for (const pay of data.payments || []) {
      await purchaseRepo.insertPayment(
        client,
        invoiceId,
        pay
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

exports.getPurchaseById = async (id) => {
  return purchaseRepo.getPurchaseById(id)
}