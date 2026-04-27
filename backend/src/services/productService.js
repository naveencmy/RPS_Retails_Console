const db = require('../config/db')
const productRepo = require('../repositories/productRepository')

exports.getProducts = async () => {
  return productRepo.getAll()
}

exports.searchProducts = async (term) => {
  return productRepo.search(term)
}

exports.getProductByBarcode = async (barcode) => {
  return productRepo.getByBarcode(barcode)
}

/*
🔥 FULL TRANSACTION
*/
exports.createProduct = async (data, userId) => {
  const client = await db.connect()

  try {
    await client.query("BEGIN")

    const product = await productRepo.insertProduct(client, data)

    for (const unit of data.units) {
      await productRepo.insertUnit(
        client,
        product.id,
        unit,
        userId
      )
    }

    await client.query("COMMIT")
    return product

  } catch (err) {
    await client.query("ROLLBACK")
    throw err
  } finally {
    client.release()
  }
}

exports.updateProduct = async (id, data, userId) => {
  const client = await db.connect()

  try {
    await client.query("BEGIN")

    await productRepo.updateProduct(client, id, data)

    for (const unit of data.units) {
      await productRepo.updateUnit(
        client,
        unit.id,
        unit,
        userId
      )
    }

    await client.query("COMMIT")

    return { message: "Product updated" }

  } catch (err) {
    await client.query("ROLLBACK")
    throw err
  } finally {
    client.release()
  }
}

exports.deleteProduct = async (id) => {
  const client = await db.connect()

  try {
    await client.query("BEGIN")
    await productRepo.deleteProduct(id)
    await client.query("COMMIT")
  } catch (err) {
    await client.query("ROLLBACK")
    throw err
  } finally {
    client.release()
  }
}