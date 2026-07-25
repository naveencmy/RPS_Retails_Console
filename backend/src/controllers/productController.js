const productService = require('../services/productService')

exports.getProducts = async (req, res, next) => {
  try {
    const products = await productService.getProducts()
    res.json(products)
  } catch (err) {
    next(err)
  }
}

exports.searchProducts = async (req, res, next) => {
  try {
    const term = req.query.q
    if (!term || term.trim() === '') {
      return res.status(400).json({ message: 'Search term required' })
    }
    const products = await productService.searchProducts(term)
    res.json(products)
  } catch (err) {
    next(err)
  }
}

exports.getProductByBarcode = async (req, res, next) => {
  try {
    const code = req.params.code
    if (!code) {
      return res.status(400).json({ message: 'Barcode required' })
    }
    const product = await productService.getProductByBarcode(code)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }
    res.json(product)
  } catch (err) {
    next(err)
  }
}

exports.createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body, req.user.id)
    res.status(201).json(product)
  } catch (err) {
    next(err)
  }
}

exports.updateProduct = async (req, res, next) => {
  try {
    const result = await productService.updateProduct(req.params.id, req.body, req.user.id)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

exports.deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id)
    res.json({ message: 'Product deleted successfully' })
  } catch (err) {
    next(err)
  }
}
