const partyService = require('../services/partyService')

exports.getParties = async (req, res, next) => {
  try {
    const data = await partyService.getParties()
    res.json(data)
  } catch (err) {
    next(err)
  }
}

exports.getPartyById = async (req, res, next) => {
  try {
    const party = await partyService.getPartyById(req.params.id)
    res.json(party)
  } catch (err) {
    next(err)
  }
}

exports.createParty = async (req, res, next) => {
  try {
    const party = await partyService.createParty(req.body)
    res.status(201).json(party)
  } catch (err) {
    next(err)
  }
}

exports.updateParty = async (req, res, next) => {
  try {
    const party = await partyService.updateParty(req.params.id, req.body)
    res.json(party)
  } catch (err) {
    next(err)
  }
}

exports.deleteParty = async (req, res, next) => {
  try {
    await partyService.deleteParty(req.params.id)
    res.json({ message: 'Party deleted' })
  } catch (err) {
    next(err)
  }
}

exports.getPartyLedger = async (req, res, next) => {
  try {
    const ledger = await partyService.getPartyLedger(req.params.id)
    res.json(ledger)
  } catch (err) {
    next(err)
  }
}
