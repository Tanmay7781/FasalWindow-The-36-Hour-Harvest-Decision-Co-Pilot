# FasalWindow System Architecture Document
**The 36-Hour Harvest & Selling Decision Co-Pilot for Smallholder Farmers**

---

## 1. Executive Overview

Smallholder farmers across India face critical 24–48 hour decision windows where harvesting standing crops and selecting the destination mandi (market) heavily impacts net household income. The core challenge is multi-dimensional:
1. **Gross vs. Net Realization:** A distant mandi quoting a higher nominal rate often yields lower net income after deducting tractor haulage costs.
2. **Short-Term Rainfall Hazards:** Moisture can trigger immediate grain discoloration, fungal infection, or severe waterlogging in open mandi auction yards.
3. **Rural Connectivity Gaps:** Real-time online access in village fields is sporadic.
4. **Trust & Human Agency:** Extension workers (Kisan Mitras) and FPO aggregators understand localized nuances (e.g., flooded river crossings, trusted commission agents) that algorithms cannot perceive.

**FasalWindow** provides an offline-first, uncertainty-aware decision-support co-pilot that balances net realization against rainfall risk and transit exposure without making fabricated AI claims.

---

## 2. Architecture Diagram

```mermaid
graph TD
    %% User Layer
    Farmer["Farmer / FPO Extension Worker"]

    %% Frontend Layer
    subgraph Frontend["React + Vite Frontend (Port 5173)"]
        UI["Dashboard UI (Outfit & Noto Sans Devanagari)"]
        Form["Harvest & Mandi Quotation Form"]
        MandiComp["Mandi Comparison & Net Realization Cards"]
        RainCard["Rainfall Spoilage Risk Meter"]
        Brief["Bilingual Decision Brief (Hindi / English)"]
        OverrideUI["Human Override & Field Context Modal"]
        LocalCache[("Browser LocalStorage Cache\n- Offline Resilient Fallback\n- Last Verified Advisory\n- Queued Field Overrides")]
    end

    %% Backend Gateway Layer
    subgraph Backend["Express.js API Gateway (Port 5000)"]
        Router["Express Router (/api/*)"]
        Validator["Input Validation Middleware"]
        FastAPIProxy["FastAPI HTTP Proxy Client (5s Timeout)"]
        PGClient["PostgreSQL pg Client & Connection Pool"]
        MemFallback[("Resilient In-Memory Fallback Store\n- Active when DB is Unreachable")]
        ErrHandler["Central Error Handler (Structured JSON)"]
    end

    %% Analytical Engine Layer
    subgraph Analytics["FastAPI Analytical Engine (Port 8001)"]
        FastAPIRouter["FastAPI Endpoints (/analyze, /price-bands)"]
        PricingEngine["Pricing & Net Realization Calculator\nNet = Gross - Transport (INR/kg)"]
        PriceBandEngine["Price Band & Quotation Range Preservation"]
        RainEngine["Rainfall Risk Assessment Heuristics\n(Low, Moderate, High, Stale, Missing)"]
        BriefEngine["Deterministic Bilingual Brief Generator\n(Hindi & English Templates)"]
        MLExtension["Planned ML Predictive Module\n(Pluggable Yield/Price Forecaster - Future)"]
    end

    %% Persistence Layer
    subgraph Database["PostgreSQL 15 Database (Port 5432)"]
        CropsTbl[("crops")]
        MandisTbl[("mandis")]
        PricesTbl[("mandi_price_observations (Synthetic Demo)")]
        TransportTbl[("transport_cost_observations (Synthetic Demo)")]
        WeatherTbl[("weather_forecasts (Synthetic Demo)")]
        AnalysisTbl[("analysis_records")]
        RecsTbl[("recommendations")]
        OverridesTbl[("human_overrides (Audit Trail)")]
    end

    %% External & Future Integrations
    subgraph ExternalPlanned["Future / Planned External Integrations (Not Active)"]
        AgmarknetLive["Live APMC Agmarknet API (Planned)"]
        IMDLive["Live IMD OpenWeather API (Planned)"]
        SMSIVR["Kisan Call Centre / SMS-IVR Dispatch (Planned)"]
    end

    %% Interactions & Data Flow
    Farmer -->|Enters Crop, Mandi Quotes & Rainfall| UI
    UI --> Form
    Form -->|POST /api/analyze| Router
    
    %% Offline Fallback Path
    UI -.->|Network Offline / Fallback| LocalCache
    LocalCache -.->|Cached Advisory with Stale Badge| UI

    %% Backend to FastAPI
    Router --> Validator
    Validator --> FastAPIProxy
    FastAPIProxy -->|HTTP POST /analyze| FastAPIRouter

    FastAPIRouter --> PricingEngine
    PricingEngine --> PriceBandEngine
    FastAPIRouter --> RainEngine
    PricingEngine --> BriefEngine
    RainEngine --> BriefEngine
    BriefEngine --> FastAPIRouter

    %% Analytical Service Response to Express
    FastAPIRouter -->|JSON Analysis Response| FastAPIProxy
    FastAPIProxy --> PGClient

    %% Express to PostgreSQL
    PGClient -->|INSERT analysis & recommendations| AnalysisTbl
    PGClient -->|INSERT recommendations| RecsTbl
    PGClient -.->|If DB Disconnected| MemFallback

    %% Express Response to React
    PGClient --> Router
    Router -->|JSON Analysis + Metadata| UI
    UI --> MandiComp
    UI --> RainCard
    UI --> Brief

    %% Human Override Flow
    Farmer -->|Overrides Algorithmic Choice + Mandatory Reason| OverrideUI
    OverrideUI -->|POST /api/overrides| Router
    Router --> PGClient
    PGClient -->|INSERT human_overrides| OverridesTbl

    %% Future Connections
    AgmarknetLive -.->|Future Feed| PricesTbl
    IMDLive -.->|Future Feed| WeatherTbl
    Brief -.->|Future SMS Dispatch| SMSIVR
```

---

## 3. Component Deep Dive

### 3.1 Frontend (`frontend/`)
- **Technology:** React 18, Vite 5, Vanilla CSS, Lucide Icons.
- **Role:** Pure client presentation and field input management. Communicates strictly with the Express API gateway (`/api/*`).
- **Offline Cache:** Serializes the latest verified decision output into browser `localStorage`. When the device loses cellular connectivity or the server is temporarily unreachable, the frontend seamlessly restores the cached advisory with an explicit, high-visibility warning banner showing generation timestamps and input freshness.
- **Bilingual Interface:** Instant tab toggle between Hindi (Devanagari script with Noto Sans) and English.

### 3.2 Express API Gateway (`backend/`)
- **Technology:** Node.js 24, Express 4.19, `pg`, `axios`.
- **Role:** Central gateway, request validator, and orchestrator.
- **FastAPI Proxying:** Connects to `http://127.0.0.1:8001` with strict 5-second timeouts and clear error propagation.
- **PostgreSQL Persistence:** Executes parameterized SQL transactions to store analysis runs, evaluated options, and human overrides.
- **Resilient Fallback:** If the PostgreSQL server is undergoing maintenance or credentials have not been configured, the backend automatically logs the advisory run in an in-memory audit store and continues serving requests with an explicit note, preventing application crashes.

### 3.3 Python Analytical Engine (`ML/`)
- **Technology:** Python 3.13, FastAPI, Pydantic 2.
- **Role:** Mathematical net price deduction, price band interval preservation, rainfall risk categorization, and deterministic bilingual brief compilation.
- **Rule-Based Rigor:** Net realization is calculated strictly via arithmetic:
  $$\text{Net Realization (INR/kg)} = \text{Gross Mandi Price (INR/kg)} - \text{Transport Cost (INR/kg)}$$
- **Uncertainty Bounds:** Preserves price intervals $[G_{\min} - T, G_{\max} - T]$ instead of collapsing them into misleading averages.
- **Extensible ML Design:** Features a clean modular interface so properly evaluated predictive yield or price forecasting models can be plugged in once real-world historical validation data becomes available.

### 3.4 PostgreSQL Database (`database/`)
- **Role:** Persistent store for master crops, regional mandis, synthetic demonstration benchmarks, analysis queries, recommendations, and human override audit trails.
- **Audit Compliance:** Every human override requires a mandatory textual reason, recording original recommendation, chosen alternative, actor identifier, and timestamp.

---

## 4. Uncertainty & Truthful AI Principles

1. **No Fabricated Machine Learning Metrics:** FasalWindow does not present fake R² scores, fictional confidence percentages, or synthetic neural network predictions.
2. **Range Preservation:** When quotes span a range (e.g. ₹24–27/kg), or when secondary sources diverge, the system flags the spread rather than silently averaging it.
3. **Stale Data Safeguards:** Forecasts older than 12 hours are clearly tagged with warning badges.
4. **Missing Weather Fallback:** If weather data is absent, the system gracefully degrades to a price-only comparison with a prominent notification.
5. **Farmer Autonomy:** The system never sells produce automatically or guarantees financial outcomes; all outputs are framed as decision-support advisory.
