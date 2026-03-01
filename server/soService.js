function formatSoFromNumber(n) {
  const seven = String(n).padStart(7, "0")
  return `SO${seven}`
}

module.exports = { formatSoFromNumber }