const reportRepo = require('../repositories/reportRepository')

exports.getDashboard = async () => {
  const [
    todaySales,
    todayPurchase,
    lowStock,
    receivablesRow,
    payablesRow,
    recent,
  ] = await Promise.all([
    reportRepo.getTodaySales(),
    reportRepo.getTodayPurchase(),
    reportRepo.getLowStock(),
    reportRepo.getTotalReceivables(),
    reportRepo.getPayablesSummary(),
    reportRepo.getRecentTransactions(),
  ])

  return {
    today_sales: Number(todaySales.total_sales) || 0,
    today_purchase: Number(todayPurchase.total_purchase) || 0,
    receivables: Number(receivablesRow.total_receivables) || 0,
    payables: Number(payablesRow.total_payables) || 0,
    low_stock: lowStock,
    recent,
  }
}

exports.getSalesReport = async (from, to) => {
  if (!from || !to) {
    throw Object.assign(new Error('Date range required (from, to)'), { status: 400 })
  }

  const fromDate = new Date(from)
  const toDate = new Date(to)

  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
    throw Object.assign(new Error('Invalid date format'), { status: 400 })
  }

  if (fromDate > toDate) {
    throw Object.assign(new Error('From date must be before to date'), { status: 400 })
  }

  return reportRepo.getSalesReport(from, to)
}

exports.getTopProducts = () => reportRepo.getTopProducts()
exports.getInventoryValue = () => reportRepo.getInventoryValue()
exports.getReceivables = () => reportRepo.getReceivableSummary()
exports.getLowStock = () => reportRepo.getLowStock()
