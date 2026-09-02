# 🏎️ Chassis Decoder

A web application for automotive telemetry and VIN decoding. It instantly breaks down vehicle specs, engine details, and chassis info by fetching data from external REST APIs and databases.

*Fun fact: Building this felt pretty similar to an old side project I did for practice where I fetched public NASA APIs to check Mars weather conditions. Same concept, different planet!*

## ✨ Features
- **Instant VIN Decoding:** Input any valid VIN to pull deep automotive telemetry and chassis details.
- **Reliable Data Fetching:** Hooks into external databases via REST APIs for accurate vehicle specs.
- **Monetization (WIP):** Configured with Google AdSense (currently debugging an issue where AdSense couldn't load the `sitemap.xml`).

## 🤖 AI Usage Declaration
**AI was used strategically for data parsing and scaffolding.**
- **What AI built:** I used AI (LLMs) specifically for UI scaffolding, generating the complex Regex required for VIN parsing, and setting up the baseline backend API routes.
- **What I built manually:** The core full-stack architecture, data formatting, external REST API connection logic, and deployment configurations were handled manually.

## 🛠️ Tech Stack & Deployment
- **Live Demo:** (https://chassis-decoder.vercel.app)
- **Deployment:** Vercel
