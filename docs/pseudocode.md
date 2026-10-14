# FasalWindow Implemented Logic Pseudocode

This document specifies the exact pseudocode reflecting the production implementation across the React frontend, Express API gateway, and FastAPI analytical service.

---

## 1. Input Validation Logic (Express & FastAPI)

```python
FUNCTION validate_analysis_request(payload):
    IF payload.crop_name IS NULL OR TRIM(payload.crop_name) == "":
        RAISE ValidationError("Field 'crop_name' is required.")

    IF payload.mandi_quotes IS EMPTY OR LENGTH(payload.mandi_quotes) == 0:
        RAISE ValidationError("At least one candidate mandi quotation must be supplied.")

    FOR EACH quote IN payload.mandi_quotes:
        IF quote.mandi_name IS NULL OR TRIM(quote.mandi_name) == "":
            RAISE ValidationError("Each quote must have a valid mandi_name.")
        IF quote.distance_km < 0:
            RAISE ValidationError("Distance cannot be negative.")
        IF quote.gross_price_per_kg IS NULL AND quote.gross_price_range IS NULL:
            RAISE ValidationError("Either a single gross price or a price range must be supplied.")

    IF payload.decision_window_hours NOT IN [12, 24, 36, 48, 72]:
        SET payload.decision_window_hours = 36  # Default window
    
    RETURN ValidatedPayload
```

---

## 2. Net-Price Calculation & Transport Unit Handling

```python
FUNCTION calculate_transport_cost_per_kg(cost_per_kg, total_cost, quantity_kg, distance_km):
    # Rule 1: Direct per-kg cost supplied
    IF cost_per_kg IS NOT NULL AND cost_per_kg > 0:
        RETURN (ROUND(cost_per_kg, 2), "₹" + cost_per_kg + "/kg", "Provided directly")

    # Rule 2: Total trip cost supplied with lot quantity
    IF total_cost IS NOT NULL AND total_cost > 0:
        IF quantity_kg IS NOT NULL AND quantity_kg > 0:
            rate = ROUND(total_cost / quantity_kg, 2)
            RETURN (rate, "₹" + rate + "/kg", "Calculated from total trip cost for " + quantity_kg + " kg")
        ELSE:
            # Ambiguity safeguard: Cannot convert without lot size
            fallback_rate = ROUND(0.08 * distance_km, 2)
            RETURN (fallback_rate, "₹" + fallback_rate + "/kg (Est.)", 
                    "WARNING: Total trip cost was supplied without quantity. Estimated at benchmark ₹0.08/km/kg.")

    # Rule 3: Regional haulage benchmark (₹0.08/km/kg)
    benchmark_rate = ROUND(MAX(0.50, distance_km * 0.08), 2)
    RETURN (benchmark_rate, "₹" + benchmark_rate + "/kg", "Estimated benchmark ₹0.08/km/kg")
```

---

## 3. Handling Price Ranges & Uncertainty Bounds

```python
FUNCTION evaluate_mandi_pricing(quote, lot_quantity_kg):
    # Determine gross bounds
    IF quote.gross_price_range IS NOT NULL:
        gross_min = MIN(quote.gross_price_range)
        gross_max = MAX(quote.gross_price_range)
        is_range = TRUE
    ELSE:
        gross_min = quote.gross_price_per_kg
        gross_max = quote.gross_price_per_kg
        is_range = FALSE

    # Compute transport deduction
    (transport_per_kg, trans_display, unit_note) = calculate_transport_cost_per_kg(
        quote.transport_cost_per_kg, quote.transport_total_cost, lot_quantity_kg, quote.distance_km
    )

    # Net realization interval arithmetic (preserves bounds)
    net_min = ROUND(MAX(0, gross_min - transport_per_kg), 2)
    net_max = ROUND(MAX(0, gross_max - transport_per_kg), 2)
    net_rep = ROUND((net_min + net_max) / 2.0, 2)

    RETURN MandiOptionResult(
        gross_min=gross_min,
        gross_max=gross_max,
        net_min=net_min,
        net_max=net_max,
        net_representative=net_rep,
        is_range=is_range,
        transport_per_kg=transport_per_kg
    )
```

---

## 4. Conflicting Quotations Handling

```python
FUNCTION check_conflicting_quotes(quote, gross_min, gross_max):
    IF quote.conflicting_quotes IS NOT NULL AND LENGTH(quote.conflicting_quotes) > 0:
        all_quotes = [gross_min, gross_max] + quote.conflicting_quotes
        lowest = MIN(all_quotes)
        highest = MAX(all_quotes)
        spread_pct = ((highest - lowest) / lowest) * 100

        # Disagreement threshold: > 10% spread triggers conflict flag
        IF spread_pct > 10.0:
            note = "Conflicting quotations detected: Sources differ between ₹" + lowest + " and ₹" + highest + 
                   " (" + spread_pct + "% spread). Preserving full range without averaging."
            # Expand bounds to preserve uncertainty rather than silent averaging
            RETURN (TRUE, note, lowest, highest)

    RETURN (FALSE, NULL, gross_min, gross_max)
```

---

## 5. Rainfall-Risk Assessment & Uncertainty Safeguards

```python
FUNCTION evaluate_rainfall_risk(forecast, window_hours):
    # Safeguard 1: Missing weather data -> Price-only mode
    IF forecast IS NULL:
        RETURN RainfallAssessment(
            status="UNKNOWN",
            is_missing=TRUE,
            label="Weather Data Unavailable",
            advice="No short-term rainfall forecast supplied. Operating in price-only analysis mode."
        )

    # Safeguard 2: Stale forecast detection (> 12 hours old)
    is_stale = FALSE
    IF forecast.forecast_timestamp IS OLDER THAN 12 HOURS:
        is_stale = TRUE

    # Deterministic rainfall threshold categorization
    amount = forecast.expected_rainfall_mm
    IF amount <= 2.0:
        status = "LOW_RISK"
        label = "Dry / Clear Sky (Low Rainfall Risk)"
        advice = "Favorable weather window. Harvest and open transport conditions suitable."
    ELIF amount <= 10.0:
        status = "MODERATE_RISK"
        label = "Showers Expected (Moderate Moisture Risk)"
        advice = "Cover trolley with waterproof tarpaulin. Harvest only if grain moisture under threshold."
    ELSE:
        status = "HIGH_RISK"
        label = "Heavy Rain / Waterlogging Alert (High Risk)"
        advice = "Heavy rainfall risk. Prefer nearest mandi to minimize transit exposure."

    IF is_stale:
        label = label + " [STALE FORECAST]"
        advice = "WARNING: Weather forecast is over 12 hours old. " + advice

    RETURN RainfallAssessment(status, label, amount, is_stale, advice)
```

---

## 6. Generating Selling Options & Trade-Off Analysis

```python
FUNCTION generate_selling_options(mandi_options, rainfall_assessment):
    # Sort options primarily by representative net realization descending
    sorted_options = SORT(mandi_options, BY net_representative DESCENDING)
    best_net_option = sorted_options[0]
    highest_gross_option = MAX(mandi_options, BY gross_max)
    closest_option = MIN(mandi_options, BY distance_km)

    tradeoff_text = []

    # Trade-off 1: Gross vs Net realization
    IF highest_gross_option.mandi_name != best_net_option.mandi_name:
        tradeoff_text.APPEND(
            highest_gross_option.mandi_name + " quotes higher gross, but after transport deduction, " +
            best_net_option.mandi_name + " yields higher net return."
        )

    # Trade-off 2: Rainfall distance exposure
    IF rainfall_assessment.status == "HIGH_RISK":
        dist_diff = best_net_option.distance_km - closest_option.distance_km
        IF dist_diff > 20:
            tradeoff_text.APPEND(
                "Rainfall Trade-off Alert: Heavy rain predicted. " + closest_option.mandi_name + 
                " is closer, reducing transit spoilage risk versus the distant option."
            )

    RETURN (best_net_option, JOIN(tradeoff_text))
```

---

## 7. Deterministic Bilingual Brief Compilation

```python
FUNCTION build_bilingual_brief(crop, village, options, recommended, rainfall, tradeoff):
    # English Template Generation
    en_brief = DecisionBriefContent(
        headline="36-Hour Harvest & Selling Decision Brief for " + crop + " (" + village + ")",
        primary_recommendation="Recommended primary option is " + recommended.mandi_name + " with net " + recommended.net_display,
        key_tradeoff=tradeoff,
        weather_alert="Weather: " + rainfall.label + ". " + rainfall.advice,
        action_steps=[
            "Confirm arrival gates and bag weights before loading.",
            "Secure waterproof tarpaulin (tirpal) on vehicle.",
            "Verify moisture meter reading with FPO aggregator."
        ],
        fpo_checklist=[
            "Ask FPO secretary if collective transport pooling is available.",
            "Confirm current commission agent cut or unloading fees."
        ],
        disclaimer="Advisory decision-support co-pilot. Farmer retains final autonomy."
    )

    # Hindi Template Generation (Devanagari)
    hi_brief = DecisionBriefContent(
        headline=crop + " के लिए 36-घंटे का कटाई एवं मंडी विक्रय निर्णय पत्र (" + village + ")",
        primary_recommendation="प्राथमिक अनुशंसित विकल्प: " + recommended.mandi_name + " (शुद्ध आय " + recommended.net_display + ")",
        key_tradeoff=tradeoff,
        weather_alert="मौसम स्थिति: " + rainfall.label + "। " + rainfall.advice,
        action_steps=[
            "फसल लोड करने से पहले मंडी में आवक और बोली की पुष्टि करें।",
            "ट्रैक्टर/ट्रॉली पर तिरपाल (वाटरप्रूफ कवर) अवश्य बांधें।",
            "कटाई से पहले स्थानीय एफपीओ से दाने की नमी जांचें।"
        ],
        fpo_checklist=[
            "FPO प्रबंधक से पूछें कि क्या सामूहिक ढुलाई उपलब्ध है।",
            "लक्षित मंडी में हम्माली व तुलाई शुल्क की जानकारी लें।"
        ],
        disclaimer="फसलविंडो एक निर्णय-सहायक प्रणाली है। कटाई और बिक्री का अंतिम निर्णय किसान भाई का अपना है।"
    )

    RETURN BilingualBrief(hi=hi_brief, en=en_brief)
```

---

## 8. PostgreSQL Persistence & Resilient Fallback

```javascript
ASYNC FUNCTION persistAnalysis(analysisResult, reqBody):
    IF PostgreSQL.isConnected():
        TRY:
            // Parameterized query execution
            INSERT INTO analysis_records (id, crop_name, village, quantity_kg, recommended_mandi_name, ...)
            VALUES ($1, $2, $3, $4, $5, ...);

            FOR EACH opt IN analysisResult.mandi_options:
                INSERT INTO recommendations (analysis_id, mandi_name, rank_order, gross_price_display, net_realization_display, ...)
                VALUES ($1, $2, $3, $4, $5, ...);
            
            RETURN { persisted_to_db: TRUE }
        CATCH dbError:
            LOG_WARNING("PostgreSQL write failed: " + dbError.message);
            // Fall back to in-memory store
            inMemoryStore.analyses.set(analysisResult.analysis_id, analysisResult);
            RETURN { persisted_to_db: FALSE, note: dbError.message }
    ELSE:
        inMemoryStore.analyses.set(analysisResult.analysis_id, analysisResult);
        RETURN { persisted_to_db: FALSE, note: "Saved in in-memory resilient audit store." }
```

---

## 9. Recording Auditable Human Overrides

```javascript
ASYNC FUNCTION recordHumanOverride(overrideData):
    IF NOT overrideData.override_reason OR TRIM(overrideData.override_reason) == "":
        RETURN ERROR 400("Override reason is mandatory for agronomic audit compliance.")

    timestamp = CURRENT_TIMESTAMP_ISO()
    IF PostgreSQL.isConnected():
        INSERT INTO human_overrides (analysis_id, original_recommended_mandi, chosen_mandi, override_reason, actor_id, created_at)
        VALUES ($1, $2, $3, $4, $5, timestamp);
        RETURN SUCCESS("Logged in PostgreSQL audit table.")
    ELSE:
        inMemoryStore.overrides.push({ ...overrideData, created_at: timestamp });
        RETURN SUCCESS("Logged in resilient memory store.")
```

---

## 10. Offline-First Caching & Fallback Logic

```javascript
ASYNC FUNCTION submitAnalysisWithOfflineFallback(payload):
    TRY:
        response = AWAIT HTTP.POST("/api/analyze", payload, TIMEOUT=5000);
        # Update local device cache upon every successful run
        LocalStorage.setItem("latest_analysis", JSON.stringify(response.analysis));
        RETURN { ...response.analysis, is_cached_fallback: FALSE }
    CATCH networkOrTimeoutError:
        # Retrieve preserved advisory from browser storage
        cachedData = LocalStorage.getItem("latest_analysis");
        IF cachedData IS NOT NULL:
            RETURN {
                ...JSON.parse(cachedData),
                is_cached_fallback: TRUE,
                cache_reason: "Network offline. Displaying cached advisory generated earlier."
            }
        ELSE:
            THROW networkOrTimeoutError
```
