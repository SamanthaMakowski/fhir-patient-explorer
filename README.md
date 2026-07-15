# FHIR Patient Data Explorer

A web app that pulls patient demographics, conditions, and medications from a public FHIR server and displays them. The browser talks to a small Express server instead of the FHIR server directly, reflecting the way health apps are built. I built this because FHIR is the standard modern EHRs like Epic use to exchange data, and I wanted to show I can work with real healthcare data the way health systems actually do.

## Running it

git clone [your repo url]
cd fhir-patient-explorer
npm install
npm run dev

Then open http://localhost:3000

## Demo patients

Search any of these IDs to see a chart populate. These live on the public HAPI test server, so the data can change over time.

| Patient ID | Name | What you'll see |
| --- | --- | --- |
| 123836453 | April Thomas | Every tab populated. 12 conditions, a med, 2 allergies. |
| 131287660 | Shannon Hooper | Allergy heavy. 4 allergies plus conditions and meds. |
| 98067569 | Alicia Rice | Medication heavy. 6 active meds. |
| 131286295 | Melissa Price | Conditions, meds, and allergies all present. |
| 90629914 | Janet Mann | Conditions, meds, and allergies. |
| 131264020 | Shannon Morton | Conditions, meds, and allergies. |
| 131271362 | Jill Sanchez | 11 conditions with allergies. |
| 131287075 | Lawrence Mclaughlin | 11 conditions with allergies. |
| 131896579 | Carlos Ramirez | A condition flagged provisional. No known allergies shows the empty state. |
| 131284103 | Jason Steele | Conditions only. Empty med and allergy tabs show empty-state handling. |

## Tech
- Client: HTML, CSS, vanilla JavaScript (no build step)
- Server: Node.js, Express (FHIR proxy tier)
- Data source: HAPI FHIR public test server (R4)


