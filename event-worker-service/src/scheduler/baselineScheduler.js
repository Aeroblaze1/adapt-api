const recomputeBaselines = require("../processors/baselineProcessor")

function startBaselineScheduler() {
  setInterval(async () => {
    try {
      await recomputeBaselines()
      console.log("Baselines recomputed")
    } catch (err) {
      console.error("Baseline recompute failed", err)
    }
  }, 300000)//5 minutes
}

module.exports = startBaselineScheduler