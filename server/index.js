require("dotenv").config();

const express = require("express");
const path = require("path");
const { fhirGet } = require("./fhirClient");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "..", "client")));

// Browser calls these /api routes instead of FHIR directly, the way SMART on
// FHIR apps keep the FHIR server behind a backend.
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/patient/:id", async (req, res) => {
  try {
    const patient = await fhirGet(`Patient/${req.params.id}`);
    res.json(patient);
  } catch (err) {
    console.error(err.message);
    res.status(502).json({ error: "Could not fetch patient" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});