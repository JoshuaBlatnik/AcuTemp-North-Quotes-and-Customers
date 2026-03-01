// Normalizes a value so comparisons are consistent (string, trimmed, lowercase).
function norm(v){
  return String(v || "").trim().toLowerCase()
}

// Checks if an item id already exists (case and whitespace insensitive).
function itemIdExists(items, itemId){
  const t = norm(itemId)
  return items.some(i => norm(i.itemId) === t)
}

// Safely converts a value to a number, returning null if invalid.
function toNumber(v){
  const n = Number(String(v).trim())
  return Number.isFinite(n) ? n : null
}

// Builds a validated inventory item from incoming payload data.
function buildItem(payload){
  const cost = toNumber(payload.cost)
  const markupPercent = toNumber(payload.markupPercent)

  if (cost === null) return { ok:false, message:"price paid must be a number" }
  if (markupPercent === null) return { ok:false, message:"markup percent must be a number" }

  return {
    ok:true,
    item:{
      itemId: String(payload.itemId).trim(),
      description: String(payload.description).trim(),
      cost,
      markupPercent,
      updatedAt: new Date().toISOString()
    }
  }
}

// Exports helpers for inventory validation and formatting.
module.exports = { itemIdExists, buildItem, norm }
