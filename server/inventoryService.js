function norm(v){
  return String(v || "").trim().toLowerCase()
}

function itemIdExists(items, itemId){
  const t = norm(itemId)
  return items.some(i => norm(i.itemId) === t)
}

function toNumber(v){
  const n = Number(String(v).trim())
  return Number.isFinite(n) ? n : null
}

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

module.exports = { itemIdExists, buildItem, norm }