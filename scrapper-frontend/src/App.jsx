import React, { useState, useEffect } from "react";

function App() {
  const [jobs, setJobs] = useState([]);
  const [role, setRole] = useState("Software Engineer");
  const [loading, setLoading] = useState(false);

  // Fetch jobs by role
  useEffect(() => {
    fetchJobs(role);
  }, [role]);

  const fetchJobs = (selectedRole) => {
    setLoading(true);
    fetch(`http://localhost:5000/jobs/${selectedRole}`)
      .then((response) => response.json())
      .then((data) => {
        setJobs(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching jobs:", error);
        setLoading(false);
      });
  };

  // Scrape LinkedIn jobs
  const handleScrape = () => {
    setLoading(true);
    fetch("http://localhost:5000/scrape-linkedin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role }),
    })
      .then((response) => response.json())
      .then(() => {
        fetchJobs(role); // Refetch jobs after scraping
      })
      .catch((error) => {
        console.error("Error scraping jobs:", error);
        setLoading(false);
      });
  };

  return (
    <div className="App">
      <h1>Job Listings for {role}</h1>
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="Software Engineer">Software Engineer</option>
        <option value="Data Scientist">Data Scientist</option>
        <option value="DevOps Engineer">DevOps Engineer</option>
        {/* Add more roles as needed */}
      </select>

      <button onClick={handleScrape} disabled={loading}>
        {loading ? "Scraping..." : "Scrape LinkedIn Jobs"}
      </button>

      {loading && <p>Loading jobs...</p>}

      <ul>
        {jobs.map((job, index) => (
          <li key={index}>
            <h3>{job.title}</h3>
            <p>{job.description}</p>
            <p>
              <strong>Source:</strong> {job.source}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
