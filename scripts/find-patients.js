const BASE = process.env.FHIR_BASE_URL || "https://hapi.fhir.org/baseR4";

async function fhir(path) {
  const res = await fetch(`${BASE}/${path}`, {
    headers: { Accept: "application/fhir+json" },
  });
  if (!res.ok) throw new Error(`${res.status} on ${path}`);
  return res.json();
}

// bundle.total is the cheap way to ask "how many" without pulling every record
async function countFor(resource, id) {
  const bundle = await fhir(`${resource}?patient=${id}&_summary=count`);
  return bundle.total || 0;
}

async function main() {
  const conditionBundle = await fhir("Condition?_count=100");
  const entries = conditionBundle.entry || [];

  const ids = new Set();
  for (const e of entries) {
    const ref = e.resource?.subject?.reference || "";
    const id = ref.split("/")[1];
    if (id) ids.add(id);
  }

  const candidates = [...ids].slice(0, 25);
  const rows = [];

  for (const id of candidates) {
    try {
      const patient = await fhir(`Patient/${id}`);
      const name = patient.name?.[0];
      const display = name
        ? `${name.family || ""}, ${(name.given || []).join(" ")}`.trim()
        : "(no name)";

      const conditions = await countFor("Condition", id);
      const meds = await countFor("MedicationRequest", id);
      const allergies = await countFor("AllergyIntolerance", id);

      rows.push({ id, display, conditions, meds, allergies });
    } catch {
      // skipping anything that fails to resolve, only want clean demo patients
    }
  }

  rows.sort((a, b) => b.conditions + b.meds - (a.conditions + a.meds));

  console.log("\nid\tconditions\tmeds\tallergies\tname");
  for (const r of rows) {
    console.log(
      `${r.id}\t${r.conditions}\t\t${r.meds}\t${r.allergies}\t\t${r.display}`
    );
  }
  console.log(`\n${rows.length} patients checked. Pick the ones with the most data.\n`);
}

main().catch((err) => {
  console.error("failed:", err.message);
  process.exit(1);
});