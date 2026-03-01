function norm(v){
  return String(v || "").trim().toLowerCase()
}

function customerIdExists(customers, customerId){
  const t = norm(customerId)
  return customers.some(c => norm(c.customerId) === t)
}

function buildCustomer(payload){
  return {
    customerId: String(payload.customerId).trim(),
    name: String(payload.name).trim(),
    phone: payload.phone ? String(payload.phone).trim() : "",
    email: payload.email ? String(payload.email).trim() : "",
    address: payload.address ? String(payload.address).trim() : "",
    notes: payload.notes ? String(payload.notes).trim() : "",
    createdAt: payload.createdAt ? payload.createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

module.exports = { norm, customerIdExists, buildCustomer }