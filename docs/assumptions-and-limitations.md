# FasalWindow Assumptions and Limitations

This document explicitly outlines the technical, operational, and agronomic assumptions, known limitations, and future development roadmaps for FasalWindow.

---

## 1. Core Architectural Assumptions

1. **Synthetic Demonstration Data:**
   - All sample mandi prices, transport rates, and weather forecasts provided in the repository (e.g. `database/seed.sql`) are strictly **synthetic demonstration data**.
   - These figures are designed solely to exercise the algorithmic comparison logic during hackathon demonstrations and test scenarios. They do not represent live commercial rates or actual IMD observations.

2. **Decision-Support vs. Automated Execution:**
   - FasalWindow is an advisory decision-support co-pilot.
   - It **never** executes automatic crop sales, issues financial commitments, or guarantees market prices, crop yields, or weather outcomes.
   - The farmer retains 100% decision-making autonomy over whether to harvest, when to cut, and where to sell.

3. **Units and Conversion Rigor:**
   - All financial comparisons are normalized to **Indian Rupees per kilogram (INR/kg)**.
   - If transportation haulage is supplied as a total vehicle trip cost (e.g., ₹2,500 per tractor-trolley), the system only converts this to a per-kg rate if the lot quantity (in kg or quintals) is explicitly provided by the farmer.
   - When lot quantity is omitted, the system refuses to guess an arbitrary load size and instead falls back to standard regional haulage distance benchmarks (₹0.08/km/kg) with an explicit warning banner.

4. **Range Preservation Over Averaging:**
   - Mandi auctions inherently produce price ranges rather than single fixed numbers.
   - The engine performs interval arithmetic on ranges $[G_{\min} - T, G_{\max} - T]$, preserving uncertainty rather than reducing it to a misleading arithmetic mean.

---

## 2. Known Limitations of Current Prototype

1. **Browser-Based Offline Scope:**
   - Offline resilience in this prototype is achieved via client-side caching (`localStorage`) of the last verified decision brief and local queueing of human overrides.
   - While effective for smartphones and tablets used by FPO coordinators in low-connectivity fields, browser caching does not serve basic feature phones without web browsers.
   - Complete SMS/IVR offline distribution requires integration with telecom gateways (see Section 3).

2. **Static Mandi Radius:**
   - The demonstration focuses on the Gwalior-Chambal regional cluster (Gwalior Laxmiganj, Dabra, Morena, Bhind). Road distances and route topology are treated as fixed distance estimates without dynamic real-time traffic or road-blockage APIs.

3. **Single-Lot Evaluation:**
   - The current analysis evaluates a single crop lot per run. Split-lot selling (e.g. selling 50% at a nearby mandi for immediate cash and storing 50% for a distant mandi) is not yet supported in this initial release.

4. **Authentication:**
   - In accordance with the hackathon prototype scope, complex user authentication (JWT/OAuth) is omitted. The audit trail captures an `actor_id` text identifier (e.g., "Ramesh Kumar - FPO Coordinator").

---

## 3. Extensibility & Future Roadmap

1. **Integration of Evaluated Machine Learning Models:**
   - The Python `ML/` package is structured with modular interfaces (`pricing.py`, `rainfall_risk.py`, `recommendations.py`).
   - Rather than training a model on synthetic data and claiming fake predictive accuracy, the architecture provides clean hook points (`MLExtension`) where genuine machine learning models (e.g. ARIMA/Prophet time-series price models or satellite-derived soil moisture estimators) can be plugged in once verified historical datasets are acquired.

2. **Kisan Call Centre & SMS/IVR Dispatch:**
   - Planned integration with government Kisan Call Centre (KCC) IVR channels and SMS gateways to push the deterministic bilingual brief directly to feature phones via automated voice calls and text messages.

3. **Live APMC Agmarknet & IMD API Integration:**
   - Direct scheduled synchronization with the Ministry of Agriculture's Agmarknet REST API and the India Meteorological Department's district agrometeorological advisories.
