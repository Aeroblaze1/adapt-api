const express = require("express")

const app = express()
app.use(express.json())

app.use((req, res) => {
  res.json({
    message: "Response from upstream service",
    path: req.path,
    method: req.method
  })
})

app.listen(5000, () => {
  console.log("Mock upstream running on port 5000")
})