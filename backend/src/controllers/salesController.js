const salesService = require('../services/salesService')

exports.createSale = async (req,res,next)=>{
  try{
    const sale = await salesService.createSale(
      req.body,
      req.user.id
    )
    res.json(sale)
  }catch(err){
    next(err)
  }
}

exports.getSaleById = async (req,res,next)=>{
  try{
    const sale = await salesService.getSaleById(req.params.id)
    res.json(sale)
  }catch(err){
    next(err)
  }
}


exports.saveQuickSale = async (req,res,next)=>{
  try{
    const data = await salesService.saveQuickSale(req.user.id, req.body)
    res.json(data)
  }catch(err){ next(err) }
}

exports.getQuickSales = async (req,res,next)=>{
  try{
    const data = await salesService.getQuickSales(req.user.id)
    res.json(data)
  }catch(err){ next(err) }
}

exports.deleteQuickSale = async (req,res,next)=>{
  try{
    await salesService.deleteQuickSale(req.params.id)
    res.json({message:"Deleted"})
  }catch(err){ next(err) }
}
exports.returnSale = async (req,res,next)=>{
  try{
    const result = await salesService.returnSale(
      req.body,
      req.user.id
    )
    res.json(result)
  }catch(err){
    next(err)
  }
}