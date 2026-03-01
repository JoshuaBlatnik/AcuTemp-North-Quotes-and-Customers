const { formatSq, sanitizeLines, computeTotal, norm: normQuote } = require("./quoteService")
const express = require("express")
const { readData, writeData } = require("./dataStore")
const { formatSoFromNumber } = require("./soService")
const { norm, customerIdExists, buildCustomer } = require("./customersService")
const { itemIdExists, buildItem, norm: normItem } = require("./inventoryService")

const router = express.Router()

router.get("/health", (req, res) => {
  res.json({ ok: true })
})

router.get("/nextSo", (req, res) => {
  const data = readData()
  res.json({
    nextSoNumber: data.nextSoNumber,
    nextSoId: formatSoFromNumber(data.nextSoNumber)
  })
})

function ensureSalesOrders(data){
  if (!Array.isArray(data.salesOrders)) data.salesOrders = []
  if (!Number.isFinite(Number(data.nextSoNumber))) data.nextSoNumber = 1
}

router.get("/customers", (req, res) => {
  const data = readData()
  res.json({ customers: data.customers })
})

router.post("/customers", (req, res) => {
  const { customerId, name, phone, email, address, notes } = req.body || {}

  if (!customerId || !name) {
    return res.status(400).json({ ok:false, message:"customerId and name are required" })
  }

  const data = readData()
  if (customerIdExists(data.customers, customerId)) {
    return res.status(409).json({ ok:false, message:"customerId already exists" })
  }

  const customer = buildCustomer({ customerId, name, phone, email, address, notes })
  data.customers.push(customer)
  writeData(data)

  res.json({ ok:true, customer })
})

router.put("/customers/:customerId", (req, res) => {
  const id = req.params.customerId
  const { name, phone, email, address, notes } = req.body || {}

  const data = readData()
  const idx = data.customers.findIndex(c => norm(c.customerId) === norm(id))
  if (idx < 0) return res.status(404).json({ ok:false, message:"customer not found" })

  const prev = data.customers[idx]
  const updated = buildCustomer({
    customerId: prev.customerId,
    name: name ?? prev.name,
    phone: phone ?? prev.phone,
    email: email ?? prev.email,
    address: address ?? prev.address,
    notes: notes ?? prev.notes,
    createdAt: prev.createdAt
  })

  data.customers[idx] = updated
  writeData(data)

  res.json({ ok:true, customer: updated })
})

router.delete("/customers/:customerId", (req, res) => {
  const id = req.params.customerId

  const data = readData()
  const before = data.customers.length
  data.customers = data.customers.filter(c => norm(c.customerId) !== norm(id))

  if (data.customers.length === before) {
    return res.status(404).json({ ok:false, message:"customer not found" })
  }

  writeData(data)
  res.json({ ok:true })
})

router.get("/inventory", (req, res) => {
  const data = readData()
  res.json({ inventory: data.inventory })
})

router.post("/inventory", (req, res) => {
  const { itemId, description, cost, markupPercent } = req.body || {}

  if (!itemId || !description) {
    return res.status(400).json({ ok:false, message:"itemId and description are required" })
  }

  const data = readData()
  if (itemIdExists(data.inventory, itemId)) {
    return res.status(409).json({ ok:false, message:"itemId already exists" })
  }

  const built = buildItem({ itemId, description, cost, markupPercent })
  if (!built.ok) return res.status(400).json({ ok:false, message: built.message })

  data.inventory.push(built.item)
  writeData(data)

  res.json({ ok:true, item: built.item })
})

router.put("/inventory/:itemId", (req, res) => {
  const itemId = req.params.itemId
  const { description, cost, markupPercent } = req.body || {}

  const data = readData()
  const idx = data.inventory.findIndex(i => norm(i.itemId) === norm(itemId))
  if (idx < 0) return res.status(404).json({ ok:false, message:"item not found" })

  const built = buildItem({ itemId: data.inventory[idx].itemId, description, cost, markupPercent })
  if (!built.ok) return res.status(400).json({ ok:false, message: built.message })

  data.inventory[idx] = { ...data.inventory[idx], ...built.item }
  writeData(data)

  res.json({ ok:true, item: data.inventory[idx] })
})

router.delete("/inventory/:itemId", (req, res) => {
  const itemId = req.params.itemId

  const data = readData()
  const before = data.inventory.length
  data.inventory = data.inventory.filter(i => norm(i.itemId) !== norm(itemId))

  if (data.inventory.length === before) {
    return res.status(404).json({ ok:false, message:"item not found" })
  }

  writeData(data)
  res.json({ ok:true })
})

router.get("/quotes", (req, res) => {
  const data = readData()
  res.json({ quotes: data.quotes })
})

router.get("/quotes/byCustomer/:customerId", (req, res) => {
  const id = req.params.customerId
  const data = readData()
  const quotes = data.quotes.filter(q => normQuote(q.customerId) === normQuote(id))
  res.json({ quotes })
})

router.post("/quotes", (req, res) => {
  const body = req.body || {}

  const data = readData()
  const quoteId = formatSq(data.nextSqNumber || 1)
  data.nextSqNumber = (data.nextSqNumber || 1) + 1

  const lines = sanitizeLines(body.lines)
  const total = computeTotal(lines)

  const quote = {
    quoteId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),

    customerId: body.customerId ? String(body.customerId).trim() : "",

    customerName: body.customerName ? String(body.customerName).trim() : "",
    phone: body.phone ? String(body.phone).trim() : "",

    billingAddress: body.billingAddress ? String(body.billingAddress).trim() : "",
    shipToAddress: body.shipToAddress ? String(body.shipToAddress).trim() : "",

    poNumber: body.poNumber ? String(body.poNumber).trim() : "",
    truckNumber: body.truckNumber ? String(body.truckNumber).trim() : "PU1",

    lines,
    total
  }

  data.quotes.push(quote)
  writeData(data)

  res.json({ ok: true, quote })
})

router.put("/quotes/:quoteId", (req, res) => {
  const id = req.params.quoteId
  const body = req.body || {}

  const data = readData()
  const idx = data.quotes.findIndex(q => normQuote(q.quoteId) === normQuote(id))
  if (idx < 0) return res.status(404).json({ ok: false, message: "quote not found" })

  const prev = data.quotes[idx]
  const lines = sanitizeLines(body.lines ?? prev.lines)
  const total = computeTotal(lines)

  const updated = {
    ...prev,
    updatedAt: new Date().toISOString(),

    customerId: body.customerId !== undefined ? String(body.customerId).trim() : prev.customerId,
    customerName: body.customerName !== undefined ? String(body.customerName).trim() : prev.customerName,
    phone: body.phone !== undefined ? String(body.phone).trim() : prev.phone,

    billingAddress: body.billingAddress !== undefined ? String(body.billingAddress).trim() : prev.billingAddress,
    shipToAddress: body.shipToAddress !== undefined ? String(body.shipToAddress).trim() : prev.shipToAddress,

    poNumber: body.poNumber !== undefined ? String(body.poNumber).trim() : prev.poNumber,
    truckNumber: body.truckNumber !== undefined ? String(body.truckNumber).trim() : prev.truckNumber,

    lines,
    total
  }

  data.quotes[idx] = updated
  writeData(data)

  res.json({ ok: true, quote: updated })
})

router.get("/quotes/:quoteId", (req, res) => {
  const id = req.params.quoteId
  const data = readData()
  const quote = data.quotes.find(q => normQuote(q.quoteId) === normQuote(id))
  if (!quote) return res.status(404).json({ ok: false, message: "quote not found" })
  res.json({ quote })
})

router.get("/salesOrders", (req, res) => {
  const data = readData()
  ensureSalesOrders(data)
  res.json({ salesOrders: data.salesOrders })
})

router.get("/salesOrders/:soId", (req, res) => {
  const id = req.params.soId
  const data = readData()
  ensureSalesOrders(data)
  const so = data.salesOrders.find(x => normQuote(x.soId) === normQuote(id))
  if (!so) return res.status(404).json({ ok:false, message:"sales order not found" })
  res.json({ salesOrder: so })
})

router.get("/salesOrders/byCustomer/:customerId", (req, res) => {
  const id = req.params.customerId
  const data = readData()
  ensureSalesOrders(data)
  const salesOrders = data.salesOrders.filter(x => normQuote(x.customerId) === normQuote(id))
  res.json({ salesOrders })
})

router.post("/salesOrders", (req, res) => {
  const body = req.body || {}

  const data = readData()
  ensureSalesOrders(data)

  let fromQuote = null
  if (body.fromQuoteId) {
    const qid = String(body.fromQuoteId).trim()
    fromQuote = data.quotes.find(q => normQuote(q.quoteId) === normQuote(qid)) || null
    if (!fromQuote) return res.status(404).json({ ok:false, message:"source quote not found" })
  }

  const soId = formatSoFromNumber(data.nextSoNumber || 1)
  data.nextSoNumber = (data.nextSoNumber || 1) + 1

  const base = fromQuote ? {
    customerId: fromQuote.customerId,
    customerName: fromQuote.customerName,
    phone: fromQuote.phone,
    billingAddress: fromQuote.billingAddress,
    shipToAddress: fromQuote.shipToAddress,
    poNumber: fromQuote.poNumber,
    truckNumber: fromQuote.truckNumber,
    lines: fromQuote.lines
  } : {}

  const lines = sanitizeLines(body.lines ?? base.lines)
  const total = computeTotal(lines)

  const so = {
    soId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),

    fromQuoteId: fromQuote ? fromQuote.quoteId : (body.fromQuoteId ? String(body.fromQuoteId).trim() : ""),

    customerId: body.customerId !== undefined ? String(body.customerId).trim() : (base.customerId || ""),
    customerName: body.customerName !== undefined ? String(body.customerName).trim() : (base.customerName || ""),
    phone: body.phone !== undefined ? String(body.phone).trim() : (base.phone || ""),

    billingAddress: body.billingAddress !== undefined ? String(body.billingAddress).trim() : (base.billingAddress || ""),
    shipToAddress: body.shipToAddress !== undefined ? String(body.shipToAddress).trim() : (base.shipToAddress || ""),

    poNumber: body.poNumber !== undefined ? String(body.poNumber).trim() : (base.poNumber || ""),
    truckNumber: body.truckNumber !== undefined ? String(body.truckNumber).trim() : (base.truckNumber || "PU1"),

    status: body.status ? String(body.status).trim() : "Open",
    notes: body.notes ? String(body.notes).trim() : "",

    lines,
    total
  }

  data.salesOrders.push(so)
  writeData(data)

  res.json({ ok:true, salesOrder: so })
})

router.put("/salesOrders/:soId", (req, res) => {
  const id = req.params.soId
  const body = req.body || {}

  const data = readData()
  ensureSalesOrders(data)
  const idx = data.salesOrders.findIndex(x => normQuote(x.soId) === normQuote(id))
  if (idx < 0) return res.status(404).json({ ok:false, message:"sales order not found" })

  const prev = data.salesOrders[idx]
  const lines = sanitizeLines(body.lines ?? prev.lines)
  const total = computeTotal(lines)

  const updated = {
    ...prev,
    updatedAt: new Date().toISOString(),

    fromQuoteId: body.fromQuoteId !== undefined ? String(body.fromQuoteId).trim() : prev.fromQuoteId,

    customerId: body.customerId !== undefined ? String(body.customerId).trim() : prev.customerId,
    customerName: body.customerName !== undefined ? String(body.customerName).trim() : prev.customerName,
    phone: body.phone !== undefined ? String(body.phone).trim() : prev.phone,

    billingAddress: body.billingAddress !== undefined ? String(body.billingAddress).trim() : prev.billingAddress,
    shipToAddress: body.shipToAddress !== undefined ? String(body.shipToAddress).trim() : prev.shipToAddress,

    poNumber: body.poNumber !== undefined ? String(body.poNumber).trim() : prev.poNumber,
    truckNumber: body.truckNumber !== undefined ? String(body.truckNumber).trim() : prev.truckNumber,

    status: body.status !== undefined ? String(body.status).trim() : prev.status,
    notes: body.notes !== undefined ? String(body.notes).trim() : prev.notes,

    lines,
    total
  }

  data.salesOrders[idx] = updated
  writeData(data)

  res.json({ ok:true, salesOrder: updated })
})

router.delete("/salesOrders/:soId", (req, res) => {
  const id = req.params.soId

  const data = readData()
  ensureSalesOrders(data)
  const before = data.salesOrders.length
  data.salesOrders = data.salesOrders.filter(x => normQuote(x.soId) !== normQuote(id))

  if (data.salesOrders.length === before) {
    return res.status(404).json({ ok:false, message:"sales order not found" })
  }

  writeData(data)
  res.json({ ok:true })
})

module.exports = router