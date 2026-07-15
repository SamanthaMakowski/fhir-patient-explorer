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

app.get("/api/patient/:id/conditions", async (req, res) => {
  try {
    const bundle = await fhirGet(`Condition?patient=${req.params.id}`);
    const conditions = (bundle.entry || []).map((e) => e.resource);
    res.json(conditions);
  } catch (err) {
    console.error(err.message);
    res.status(502).json({ error: "Could not fetch conditions" });
  }
});

app.get("/api/patient/:id/medications", async (req, res) => {
  try {
    const bundle = await fhirGet(`MedicationRequest?patient=${req.params.id}`);
    const medications = (bundle.entry || []).map((e) => e.resource);
    res.json(medications);
  } catch (err) {
    console.error(err.message);
    res.status(502).json({ error: "Could not fetch medications" });
  }
});

app.get("/api/patient/:id/allergies", async (req, res) => {
  try {
    const bundle = await fhirGet(`AllergyIntolerance?patient=${req.params.id}`);
    const allergies = (bundle.entry || []).map((e) => e.resource);
    res.json(allergies);
  } catch (err) {
    console.error(err.message);
    res.status(502).json({ error: "Could not fetch allergies" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});



