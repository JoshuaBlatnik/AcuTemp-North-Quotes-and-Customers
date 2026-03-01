// Normalizes a value so comparisons are consistent (string, trimmed, lowercase).
function norm(v){
  return String(v || "").trim().toLowerCase()
}

// Checks if a customer id already exists (case and whitespace insensitive).
function customerIdExists(customers, customerId){
  const t = norm(customerId)
  return customers.some(c => norm(c.customerId) === t)
}

// Builds a clean customer object from incoming payload data.
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

// Exports helper functions for customer validation and formatting.
module.exports = { norm, customerIdExists, buildCustomer }
