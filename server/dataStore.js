// Imports the file system module to read and write local files.
const fs = require("fs")
// Imports path utilities to safely resolve file locations.
const path = require("path")

// Resolves the full path to data.json in the project root.
const dataPath = path.join(__dirname, "..", "data.json")

// Reads and parses the JSON data file.
function readData() {
  const raw = fs.readFileSync(dataPath, "utf8")
  return JSON.parse(raw)
}

// Writes updated data back to the JSON file with formatting.
function writeData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), "utf8")
}

// Exports the read and write helpers for use in routes.
module.exports = { readData, writeData }
