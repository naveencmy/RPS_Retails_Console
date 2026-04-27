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

    if (!term || term.trim() === "") {
      return res.status(400).json({ message: "Search term required" })
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
      return res.status(400).json({ message: "Barcode required" })
    }

    const product = await productService.getProductByBarcode(code)

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    res.json(product)
  } catch (err) {
    next(err)
  }
}


exports.createProduct = async (req, res, next) => {
  try {
    const data = req.body

  
    if (!data.name || !data.units || data.units.length === 0) {
      return res.status(400).json({
        message: "Product name and units required"
      })
    }

    const product = await productService.createProduct(
      data,
      req.user.id  
    )

    res.status(201).json(product)

  } catch (err) {
    next(err)
  }
}

exports.updateProduct = async (req, res, next) => {
  try {
    const id = req.params.id
    const data = req.body

    if (!id) {
      return res.status(400).json({ message: "Product ID required" })
    }

    if (!data.name || !data.units) {
      return res.status(400).json({
        message: "Invalid product data"
      })
    }

    const result = await productService.updateProduct(
      id,
      data,
      req.user.id  
    )

    res.json(result)

  } catch (err) {
    next(err)
  }
}


exports.deleteProduct = async (req, res, next) => {
  try {
    const id = req.params.id

    if (!id) {
      return res.status(400).json({ message: "Product ID required" })
    }

    await productService.deleteProduct(id)

    res.json({ message: "Product deleted successfully" })

  } catch (err) {
    next(err)
  }
}