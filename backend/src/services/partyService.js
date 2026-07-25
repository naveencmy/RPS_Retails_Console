const partyRepo = require('../repositories/partyRepository')

exports.getParties = async () => {
  return partyRepo.getAll()
}

exports.getPartyById = async (id) => {
  if (!id) {
    throw Object.assign(new Error('Party ID required'), { status: 400 })
  }
  const party = await partyRepo.getById(id)
  if (!party) {
    throw Object.assign(new Error('Party not found'), { status: 404 })
  }
  return party
}

exports.createParty = async (data) => {
  if (!data.name || !data.name.trim()) {
    throw Object.assign(new Error('Party name is required'), { status: 400 })
  }

  if (!data.phone || !data.phone.trim()) {
    throw Object.assign(new Error('Phone number is required'), { status: 400 })
  }

  if (!data.type || !['customer', 'supplier'].includes(data.type)) {
    throw Object.assign(new Error('Type must be customer or supplier'), { status: 400 })
  }

  return partyRepo.insertParty({
    ...data,
    name: data.name.trim(),
    phone: data.phone.trim(),
  })
}

exports.updateParty = async (id, data) => {
  if (!id) {
    throw Object.assign(new Error('Party ID required'), { status: 400 })
  }

  if (!data.name || !data.name.trim()) {
    throw Object.assign(new Error('Party name is required'), { status: 400 })
  }

  if (!data.phone || !data.phone.trim()) {
    throw Object.assign(new Error('Phone number is required'), { status: 400 })
  }

  const result = await partyRepo.updateParty(id, {
    ...data,
    name: data.name.trim(),
    phone: data.phone.trim(),
  })

  if (!result) {
    throw Object.assign(new Error('Party not found'), { status: 404 })
  }

  return result
}

exports.deleteParty = async (id) => {
  if (!id) {
    throw Object.assign(new Error('Party ID required'), { status: 400 })
  }

  const hasReferences = await partyRepo.hasInvoiceReferences(id)
  if (hasReferences) {
    throw Object.assign(new Error('Cannot delete party with existing transactions'), { status: 409 })
  }

  await partyRepo.deleteParty(id)
}

exports.getPartyLedger = async (partyId) => {
  if (!partyId) {
    throw Object.assign(new Error('Party ID required'), { status: 400 })
  }
  return partyRepo.getLedger(partyId)
}
