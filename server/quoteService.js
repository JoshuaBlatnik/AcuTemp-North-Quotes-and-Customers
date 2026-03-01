// Pads a number to seven digits with leading zeros.
function pad7(n){
  return String(n).padStart(7, "0")
}

// Formats a sales quote id using the SQ prefix.
function formatSq(n){
  return "SQ" + pad7(n)
}

// Normalizes a value for consistent string comparisons.
function norm(v){
  return String(v || "").trim().toLowerCase()
}

// Safely converts a value to a number, returning null if invalid.
function toNumber(v){
  const n = Number(String(v).trim())
  return Number.isFinite(n) ? n : null
}

// Computes the line amount from price and quantity.
function computeAmount(price, qty){
  const p = toNumber(price)
  const q = toNumber(qty)
  if (p === null || q === null) return 0
  return p * q
}

// Cleans and standardizes incoming line items.
function sanitizeLines(lines){
  const src = Array.isArray(lines) ? lines : []
  return src.map((x, idx) => {
    const itemId = x && x.itemId ? String(x.itemId).trim() : ""
    const description = x && x.description ? String(x.description).trim() : ""
    const pricePerUnit = x && x.pricePerUnit !== undefined ? String(x.pricePerUnit).trim() : "0"
    const quantity = x && x.quantity !== undefined ? String(x.quantity).trim() : "1"
    const amount = computeAmount(pricePerUnit, quantity)

    return {
      line: idx + 1,
      itemId,
      description,
      pricePerUnit: toNumber(pricePerUnit) ?? 0,
      quantity: toNumber(quantity) ?? 0,
      amount
    }
  })
}

// Computes the total for all provided line items.
function computeTotal(lines){
  return sanitizeLines(lines).reduce((sum, l) => sum + (Number(l.amount) || 0), 0)
}

// Exports helpers used for quote formatting and calculations.
module.exports = { formatSq, norm, sanitizeLines, computeTotal }
