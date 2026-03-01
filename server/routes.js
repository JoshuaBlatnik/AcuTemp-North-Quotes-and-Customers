// ================================
// Imports and Router Setup
// ================================

// Import quote utilities for formatting IDs, sanitizing line items, computing totals, and normalizing values.
const { formatSq, sanitizeLines, computeTotal, norm: normQuote } = require("./quoteService")
// Import Express to define API routes.
const express = require("express")
// Import persistence helpers for reading and writing stored data.
const { readData, writeData } = require("./dataStore")
// Import sales order ID formatter.
const { formatSoFromNumber } = require("./soService")
// Import customer utilities for normalization, duplicate checks, and safe object creation.
const { norm, customerIdExists, buildCustomer } = require("./customersService")
// Import inventory utilities for duplicate checks, item building, and normalization.
const { itemIdExists, buildItem, norm: normItem } = require("./inventoryService")

// Create an Express router instance to handle API endpoints.
const router = express.Router()



// ================================
// Health and System Endpoints
// ================================

// Health check endpoint to confirm that the API is running.
router.get("/health", (req, res) => {
  res.json({ ok: true })
})

// Return the next available sales order number and formatted SO ID.
router.get("/nextSo", (req, res) => {
  const data = readData()
  res.json({
    nextSoNumber: data.nextSoNumber,
    nextSoId: formatSoFromNumber(data.nextSoNumber)
  })
})

// Ensure that sales order data structures exist and are valid.
function ensureSalesOrders(data){
  if (!Array.isArray(data.salesOrders)) data.salesOrders = []
  if (!Number.isFinite(Number(data.nextSoNumber))) data.nextSoNumber = 1
}



// ================================
// Customer Routes
// ================================

// Get all customers.
router.get("/customers", (req, res) => {
  const data = readData()
  res.json({ customers: data.customers })
})

// Create a new customer.
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

// Update an existing customer.
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

// Delete a customer.
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



// ================================
// Inventory Routes
// ================================

// Get all inventory items.
router.get("/inventory", (req, res) => {
  const data = readData()
  res.json({ inventory: data.inventory })
})

// Create a new inventory item.
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

// Update an existing inventory item.
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

// Delete an inventory item.
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



// ================================
// Quote Routes
// ================================

// Get all quotes.
router.get("/quotes", (req, res) => {
  const data = readData()
  res.json({ quotes: data.quotes })
})

// Get quotes by customer ID.
router.get("/quotes/byCustomer/:customerId", (req, res) => {
  const id = req.params.customerId
  const data = readData()
  const quotes = data.quotes.filter(q => normQuote(q.customerId) === normQuote(id))
  res.json({ quotes })
})

// Create a new quote.
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



// ================================
// Sales Order Routes
// ================================

// Get all sales orders.
router.get("/salesOrders", (req, res) => {
  const data = readData()
  ensureSalesOrders(data)
  res.json({ salesOrders: data.salesOrders })
})

// Create a new sales order.
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
    fromQuoteId: fromQuote ? fromQuote.quoteId : "",
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

// Export the router so it can be mounted in server.js.
module.exports = router
