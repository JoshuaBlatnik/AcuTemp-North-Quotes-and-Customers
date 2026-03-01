// Format a numeric value into a standardized seven digit sales order ID.
function formatSoFromNumber(n) {
  // Convert the number to a string and pad it with leading zeros to ensure seven digits.
  const seven = String(n).padStart(7, "0")
  // Prefix the padded number with "SO" to create the final sales order ID.
  return `SO${seven}`
}

// Export the formatter so it can be used in other modules.
module.exports = { formatSoFromNumber }
