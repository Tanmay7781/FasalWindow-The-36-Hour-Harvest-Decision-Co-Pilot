# FasalWindow Acceptance Testing Checklist & Results

This document records the acceptance verification checklist and actual test execution results across all requirements.

---

## 1. Automated Test Results Summary

| Test Suite | Framework | Target Component | Tests Run | Tests Passed | Status |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **Python ML Analytics** | `pytest 9.1.1` | `ML/tests/test_analytics.py` | 7 | 7 | **PASS (100%)** |
| **Express Backend API** | Node `assert` | `backend/tests/api.test.js` | 6 | 6 | **PASS (100%)** |
| **React Frontend Build** | Vite 5.4.21 | `frontend/` production bundle | 1 | 1 | **PASS (100%)** |

---

## 2. Requirement-by-Requirement Verification Checklist

### Core Arithmetic & Unit Consistency
- [x] **Net Realization Exact Arithmetic:** `Net = Gross - Transport` calculated in INR/kg.
  - *Automated Test:* `test_net_price_calculation_exact` (PASS).
- [x] **Unit Consistency Safeguards:** Rejection of ambiguous total trip costs without quantity.
  - *Automated Test:* `test_transport_total_cost_requires_quantity` (PASS).
- [x] **Price Range Preservation:** Intervals `[min, max]` preserved across calculations without silent averaging.
  - *Automated Test:* `test_price_range_preservation` (PASS).
- [x] **Conflicting Quotation Handling:** Disagreements >10% expand bounds and flag explicit warning.
  - *Automated Test:* `test_conflicting_quotations_handling` (PASS).

### Weather & Uncertainty Safeguards
- [x] **Missing Weather Fallback:** Operates in price-only analysis mode with explicit alert.
  - *Automated Test:* `test_missing_weather_fallback` (PASS).
- [x] **Stale Weather Warnings:** Forecasts >12 hours old tagged with `[STALE FORECAST]` badge.
  - *Automated Test:* `test_stale_weather_warning` (PASS).
- [x] **Absence of Fake AI Guarantees:** Strict framing as decision-support advisory; farmer autonomy disclaimer present in every response.
  - *Automated Test:* `test_fastapi_analyze_endpoint` (PASS).

### Express API Gateway & Resilience
- [x] **Input Validation:** Rejects empty `crop_name` or empty `mandi_quotes` with HTTP 400.
  - *Automated Test:* `POST /api/analyze` input validation (PASS).
- [x] **FastAPI Timeout & Error Classification:** 5000ms timeout configured with distinct `FASTAPI_TIMEOUT` error code.
- [x] **Database Resilience:** If PostgreSQL is offline/unreachable, gracefully logs to resilient in-memory store without crashing or faking success.
  - *Automated Test:* `backend/tests/api.test.js` (PASS).
- [x] **Human Override Logging:** Enforces mandatory textual reason with HTTP 400 validation; persists override records.
  - *Automated Test:* `POST /api/overrides` validation and creation (PASS).

### Frontend UI & Aesthetics
- [x] **Agricultural Visual Theme:** Curated emerald, harvest gold, and slate palette with Outfit and Noto Sans typography.
- [x] **Mandi Comparison Cards:** Visual cards displaying gross price, haulage, and prominent net realization.
- [x] **Bilingual Decision Brief:** Instant tab toggle between Hindi (Devanagari) and English templates.
- [x] **Offline Cache Transparency:** Visual `CachedIndicator` banner highlighting cached timestamp and `NOT LIVE DATA` badge when offline.
- [x] **Human Override Modal:** Form allowing selection of alternative mandi with mandatory reason and actor identifier.
- [x] **Demo Scenario Presets:** One-click triggers for hackathon evaluators to test core trade-offs.

---

## 3. Actual Command Execution Logs

### ML Analytics Tests (`pytest`)
```text
============================= test session starts =============================
platform win32 -- Python 3.13.5, pytest-9.1.1, pluggy-1.6.0
rootdir: F:\IIIT_Gwalior_Hackathon
collecting ... collected 7 items

ML/tests/test_analytics.py::test_net_price_calculation_exact PASSED      [ 14%]
ML/tests/test_analytics.py::test_price_range_preservation PASSED         [ 28%]
ML/tests/test_analytics.py::test_conflicting_quotations_handling PASSED  [ 42%]
ML/tests/test_analytics.py::test_transport_total_cost_requires_quantity PASSED [ 57%]
ML/tests/test_analytics.py::test_missing_weather_fallback PASSED         [ 71%]
ML/tests/test_analytics.py::test_stale_weather_warning PASSED            [ 85%]
ML/tests/test_analytics.py::test_fastapi_analyze_endpoint PASSED         [100%]

======================== 7 passed, 2 warnings in 0.70s ========================
```

### Backend API Tests (`node tests/api.test.js`)
```text
--- Running Express Backend Automated Tests ---
✓ PASS: GET /api/health returns 200 with service status
✓ PASS: GET /api/crops returns crops catalogue
✓ PASS: POST /api/analyze rejects empty crop_name with 400
✓ PASS: POST /api/analyze rejects empty mandi_quotes with 400
✓ PASS: POST /api/overrides enforces mandatory override_reason with 400
✓ PASS: POST /api/overrides logs human override audit record

All Backend Tests Completed: 6 passed, 0 failed.
```

### Frontend Production Build (`vite build`)
```text
vite v5.4.21 building for production...
transforming...
✓ 1492 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   1.20 kB │ gzip:  0.67 kB
dist/assets/index-BZrRuapW.css    4.29 kB │ gzip:  1.61 kB
dist/assets/index-COmmtLj8.js   205.78 kB │ gzip: 60.65 kB
✓ built in 1.15s
```
