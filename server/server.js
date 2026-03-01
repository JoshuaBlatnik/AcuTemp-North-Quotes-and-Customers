// Import Express to create the web server.
const express = require("express")
// Import path to safely resolve directory paths.
const path = require("path")
// Import all API routes from the routes module.
const apiRoutes = require("./routes")

// Create the Express application instance.
const app = express()
// Define the port the server will listen on.
const port = 3000

// Enable JSON parsing for all incoming request types.
app.use(express.json({ type: "*/*" }))

// Serve static files from the public folder.
app.use(express.static(path.join(__dirname, "..", "public")))

// Mount all API routes under the /api prefix.
app.use("/api", apiRoutes)

// Start the server and bind it to all network interfaces.
app.listen(port, "0.0.0.0", () => {
  // Log a basic confirmation message when the server starts.
  console.log(`AcuTemp app running`)
  // Log the local access URL for the machine running the server.
  console.log(`Local:   http://localhost:${port}`)
  // Log the network access URL for other devices on the same network.
  console.log(`Network: http://192.168.0.85:${port}`)
})
