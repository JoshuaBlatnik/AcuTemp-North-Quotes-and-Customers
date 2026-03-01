const express = require("express")
const path = require("path")
const apiRoutes = require("./routes")

const app = express()
const port = 3000

app.use(express.json({ type: "*/*" }))
app.use(express.static(path.join(__dirname, "..", "public")))

app.use("/api", apiRoutes)

app.listen(port, "0.0.0.0", () => {
  console.log(`AcuTemp app running`)
  console.log(`Local:   http://localhost:${port}`)
  console.log(`Network: http://192.168.0.85:${port}`)
})