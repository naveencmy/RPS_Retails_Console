const db = require('../config/db')
const productRepo = require('../repositories/productRepository')

exports.getProducts = async () => {
  return productRepo.getAll()
}

exports.searchProducts = async (term) => {
  if (!term || !term.trim()) {
    throw Object.assign(new Error('Search term required'), { status: 400 })
  }
  return productRepo.search(term.trim())
}

exports.getProductByBarcode = async (barcode) => {
  if (!barcode) {
    throw Object.assign(new Error('Barcode required'), { status: 400 })
  }
  return productRepo.getByBarcode(barcode)
}

exports.createProduct = async (data, userId) => {
  if (!data.name || !data.name.trim()) {
    throw Object.assign(new Error('Product name is required'), { status: 400 })
  }

  if (!data.units || !Array.isArray(data.units) || data.units.length === 0) {
    throw Object.assign(new Error('At least one unit is required'), { status: 400 })
  }

  for (const unit of data.units) {
    if (!unit.unit_name || !unit.unit_name.trim()) {
      throw Object.assign(new Error('Unit name is required for all units'), { status: 400 })
    }
    if (unit.purchase_rate !== undefined && unit.purchase_rate < 0) {
      throw Object.assign(new Error('Purchase rate cannot be negative'), { status: 400 })
    }
    if (unit.sales_rate !== undefined && unit.sales_rate < 0) {
      throw Object.assign(new Error('Sales rate cannot be negative'), { status: 400 })
    }
  }

  const client = await db.connect()

  try {
    await client.query('BEGIN')

    const product = await productRepo.insertProduct(client, {
      ...data,
      name: data.name.trim(),
    })

    for (const unit of data.units) {
      await productRepo.insertUnit(client, product.id, unit, userId)
    }

    await client.query('COMMIT')
    return product
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

exports.updateProduct = async (id, data, userId) => {
  if (!id) {
    throw Object.assign(new Error('Product ID required'), { status: 400 })
  }

  if (!data.name || !data.name.trim()) {
    throw Object.assign(new Error('Product name is required'), { status: 400 })
  }

  if (!data.units || !Array.isArray(data.units)) {
    throw Object.assign(new Error('Units data required'), { status: 400 })
  }

  const client = await db.connect()

  try {
    await client.query('BEGIN')

    await productRepo.updateProduct(client, id, { ...data, name: data.name.trim() })

    for (const unit of data.units) {
      if (unit.id) {
        await productRepo.updateUnit(client, unit.id, unit, userId)
      }
    }

    await client.query('COMMIT')
    return { message: 'Product updated' }
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

exports.deleteProduct = async (id) => {
  if (!id) {
    throw Object.assign(new Error('Product ID required'), { status: 400 })
  }

  const hasReferences = await productRepo.hasInvoiceReferences(id)
  if (hasReferences) {
    throw Object.assign(new Error('Cannot delete product with existing sales or purchase records'), { status: 409 })
  }

  const client = await db.connect()

  try {
    await client.query('BEGIN')
    await productRepo.deleteProduct(client, id)
    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}
