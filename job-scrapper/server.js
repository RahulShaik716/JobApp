require("dotenv").config(); // Load environment variables from .env file
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const puppeteer = require("puppeteer");
const Job = require("./models/Job");

// Initialize Express app
const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Atlas connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Atlas connected"))
  .catch((err) => console.error("Database connection error:", err));

// Example scrape function (LinkedIn)
async function scrapeLinkedInJobs(role) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`https://www.linkedin.com/jobs/search/?keywords=${role}`, {
    waitUntil: "networkidle2",
  });

  const jobs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".result-card")).map((job) => ({
      title: job.querySelector(".result-card__title").innerText,
      description: job.querySelector(".result-card__snippet").innerText,
    }));
  });

  await browser.close();
  return jobs;
}

// Save jobs to MongoDB
app.post("/scrape-linkedin", async (req, res) => {
  const role = req.body.role;

  try {
    const jobs = await scrapeLinkedInJobs(role);

    const jobDocs = jobs.map((job) => ({
      title: job.title,
      description: job.description,
      role,
      source: "LinkedIn",
    }));

    await Job.insertMany(jobDocs);
    res.json({ message: "Jobs scraped and saved to MongoDB Atlas." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error scraping jobs." });
  }
});

// Fetch jobs by role
app.get("/jobs/:role", async (req, res) => {
  const role = req.params.role;

  try {
    const jobs = await Job.find({ role });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: "Error fetching jobs." });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
