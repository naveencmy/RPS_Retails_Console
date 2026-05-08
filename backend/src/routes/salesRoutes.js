const express = require('express')
const router = express.Router()
const salesController = require('../controllers/salesController')
const auth = require('../middleware/authMiddleware')
/*
QUICK SALES / DRAFTS
*/
router.post('/quick',auth,salesController.saveQuickSale)
router.get('/quick',auth,salesController.getQuickSales)
router.delete('/quick/:id',auth,salesController.deleteQuickSale)
/*
Sales
*/
router.post('/create',auth,salesController.createSale)
router.post('/return',auth,salesController.returnSale)
router.get('/:id',auth,salesController.getSaleById)

module.exports = router