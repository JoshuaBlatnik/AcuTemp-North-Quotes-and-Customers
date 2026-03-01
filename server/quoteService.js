function pad7(n){
  return String(n).padStart(7, "0")
}

function formatSq(n){
  return "SQ" + pad7(n)
}

function norm(v){
  return String(v || "").trim().toLowerCase()
}

function toNumber(v){
  const n = Number(String(v).trim())
  return Number.isFinite(n) ? n : null
}

function computeAmount(price, qty){
  const p = toNumber(price)
  const q = toNumber(qty)
  if (p === null || q === null) return 0
  return p * q
}

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

function computeTotal(lines){
  return sanitizeLines(lines).reduce((sum, l) => sum + (Number(l.amount) || 0), 0)
}

module.exports = { formatSq, norm, sanitizeLines, computeTotal }