const input = document.getElementById("patient-id-input");
const searchBtn = document.getElementById("search-btn");
const chart = document.getElementById("chart");
const banner = document.getElementById("banner");
const panel = document.getElementById("panel");
const message = document.getElementById("message");

let currentPatientId = null;

async function loadPatient(id) {
  message.textContent = "Loading patient...";
  chart.classList.add("hidden");

  try {
    const res = await fetch(`/api/patient/${id}`);
    if (!res.ok) throw new Error("not found");
    const patient = await res.json();

    currentPatientId = id;
    renderBanner(patient);
    renderDemographics(patient);
    resetNav();
    chart.classList.remove("hidden");
    message.textContent = "";
  } catch (err) {
    chart.classList.add("hidden");
    message.textContent = `No patient found for ID "${id}".`;
  }
}

function resetNav() {
  navItems.forEach((n) => n.classList.remove("active"));
  const demographicsItem = document.querySelector('.nav-item[data-section="demographics"]');
  if (demographicsItem) demographicsItem.classList.add("active");
}

function renderBanner(patient) {
  const name = patient.name?.[0];
  const fullName = name ? `${name.family}, ${name.given?.join(" ")}` : "Unknown";
  const mrn = patient.identifier?.[0]?.value || "N/A";
  const dob = patient.birthDate || "N/A";
  const sex = patient.gender || "N/A";

  banner.innerHTML = `
    <span class="banner-name">${fullName}</span>
    <span>MRN ${mrn}</span>
    <span>DOB ${dob}</span>
    <span>${sex}</span>
  `;
}

function renderDemographics(patient) {
  const name = patient.name?.[0];
  const fullName = name ? `${name.given?.join(" ")} ${name.family}` : "Unknown";
  const address = patient.address?.[0];
  const addressText = address
    ? `${address.line?.join(" ")}, ${address.city}, ${address.state} ${address.postalCode}`
    : "Not recorded";

  panel.innerHTML = `
    <dl class="detail-list">
      <dt>Full name</dt><dd>${fullName}</dd>
      <dt>Date of birth</dt><dd>${patient.birthDate || "N/A"}</dd>
      <dt>Sex</dt><dd>${patient.gender || "N/A"}</dd>
      <dt>Phone</dt><dd>${patient.telecom?.[0]?.value || "Not recorded"}</dd>
      <dt>Address</dt><dd>${addressText}</dd>
    </dl>
  `;
}

searchBtn.addEventListener("click", () => {
  const id = input.value.trim();
  if (id) loadPatient(id);
});

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") searchBtn.click();
});

const navItems = document.querySelectorAll(".nav-item");

navItems.forEach((item) => {
  item.addEventListener("click", () => {
    if (!currentPatientId) return;

    navItems.forEach((n) => n.classList.remove("active"));
    item.classList.add("active");

    const section = item.dataset.section;
    loadSection(section);
  });
});

async function loadSection(section) {
  if (section === "demographics") {
    const res = await fetch(`/api/patient/${currentPatientId}`);
    const patient = await res.json();
    renderDemographics(patient);
    return;
  }

  panel.innerHTML = "<p class='panel-loading'>Loading...</p>";

  try {
    const res = await fetch(`/api/patient/${currentPatientId}/${section}`);
    const data = await res.json();

    if (section === "conditions") renderConditions(data);
    if (section === "medications") renderMedications(data);
    if (section === "allergies") renderAllergies(data);
  } catch (err) {
    panel.innerHTML = "<p class='panel-empty'>Could not load this section.</p>";
  }
}

function renderConditions(conditions) {
  if (!conditions.length) {
    panel.innerHTML = "<p class='panel-empty'>No conditions recorded.</p>";
    return;
  }

  panel.innerHTML = conditions
    .map((c) => {
      const name = c.code?.text || c.code?.coding?.[0]?.display || "Unknown condition";
      const onset = c.onsetDateTime || "Date unknown";
      const status = c.clinicalStatus?.coding?.[0]?.code || "unknown";
      const verification = c.verificationStatus?.coding?.[0]?.code;

      const verificationTag =
        verification && verification !== "confirmed"
          ? `<span class="badge badge-warning">${verification}</span>`
          : "";

      return `
        <div class="record">
          <div class="record-header">
            <span class="record-main">${name}</span>
            ${statusBadge(status)}
            ${verificationTag}
          </div>
          <div class="record-sub">Onset ${onset}</div>
        </div>
      `;
    })
    .join("");
}

function renderMedications(medications) {
  if (!medications.length) {
    panel.innerHTML = "<p class='panel-empty'>No medications recorded.</p>";
    return;
  }

  panel.innerHTML = medications
    .map((m) => {
      const name = m.medicationCodeableConcept?.text ||
        m.medicationCodeableConcept?.coding?.[0]?.display || "Unknown medication";
      const dosage = m.dosageInstruction?.[0]?.text || "No dosage instructions";
      const status = m.status || "unknown";
      return `
        <div class="record">
          <div class="record-header">
            <span class="record-main">${name}</span>
            ${statusBadge(status)}
          </div>
          <div class="record-sub">${dosage}</div>
        </div>
      `;
    })
    .join("");
}

function renderAllergies(allergies) {
  if (!allergies.length) {
    panel.innerHTML = "<p class='panel-empty'>No known allergies.</p>";
    return;
  }

  panel.innerHTML = allergies
    .map((a) => {
      const name = a.code?.text || a.code?.coding?.[0]?.display || "Unknown allergen";
      return `
        <div class="record">
          <div class="record-main">${name}</div>
        </div>
      `;
    })
    .join("");
}

function statusBadge(status) {
  const map = {
    active: "badge-active",
    confirmed: "badge-active",
    resolved: "badge-neutral",
    inactive: "badge-neutral",
    provisional: "badge-warning",
    stopped: "badge-neutral",
    unknown: "badge-neutral",
  };
  const cls = map[status] || "badge-neutral";
  return `<span class="badge ${cls}">${status}</span>`;
}