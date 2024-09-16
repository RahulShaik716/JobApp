const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: String,
  description: String,
  role: String,
  source: String, // Source could be LinkedIn, Indeed, or GitHub
});

module.exports = mongoose.model("Job", jobSchema);
