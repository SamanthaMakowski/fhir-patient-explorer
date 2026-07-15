# FHIR Patient Data Explorer

A web app that pulls patient demographics, conditions, and medications from a public FHIR server and displays them. The browser talks to a small Express server instead of the FHIR server directly, reflecting the way health apps are built. I built this because FHIR is the standard modern EHRs like Epic use to exchange data, and I wanted to show I can work with real healthcare data the way health systems actually do.

## Status
In active development.

## Tech
- Client: HTML, CSS, vanilla JavaScript (no build step)
- Server: Node.js, Express (FHIR proxy tier)
- Data source: HAPI FHIR public test server (R4)