const FHIR_BASE_URL = process.env.FHIR_BASE_URL;

// Only file that talks to the FHIR server, so the base URL lives in one place.
async function fhirGet(path) {
  const url = `${FHIR_BASE_URL}/${path}`;

  const response = await fetch(url, {
    headers: { Accept: "application/fhir+json" },
  });

  if (!response.ok) {
    throw new Error(`FHIR request failed: ${response.status} for ${path}`);
  }

  return response.json();
}

module.exports = { fhirGet };