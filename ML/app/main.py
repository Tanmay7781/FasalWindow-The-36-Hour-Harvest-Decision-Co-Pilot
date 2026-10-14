import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .schemas import (
    AnalysisRequest,
    AnalysisResponse,
    PriceBandsRequest,
    RainfallForecastInput,
    RainfallAssessment,
    MandiOptionResult,
    MandiQuoteInput
)
from .pricing import evaluate_mandi_pricing, calculate_transport_cost_per_kg
from .rainfall_risk import evaluate_rainfall_risk
from .recommendations import generate_tradeoff_summary, build_bilingual_brief

app = FastAPI(
    title="FasalWindow Analytical Service",
    description="Offline-first, uncertainty-aware harvest & market decision analytics for smallholder farmers.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEMO_DISCLAIMER = (
    "DEMO NOTICE: All mandi quotes, transport benchmarks, and weather forecasts provided in this system "
    "are synthetic demonstration inputs. They must not be interpreted as live commercial guarantees."
)

FARMER_DISCLAIMER = (
    "FasalWindow is a decision-support advisory tool. It does not execute automatic sales or guarantee "
    "yields, net realizations, or weather events. The farmer retains full autonomy over all harvest and marketing choices."
)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "fasalwindow-ml-analytics",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "1.0.0"
    }

@app.post("/analyze", response_model=AnalysisResponse)
def analyze_harvest_options(payload: AnalysisRequest):
    """
    Main analytical engine endpoint.
    Processes mandi quotes, rainfall forecasts, computes net realization bands,
    evaluates weather-transport risks, and generates bilingual decision briefs.
    """
    analysis_id = str(uuid.uuid4())
    now_iso = datetime.now(timezone.utc).isoformat()
    warnings: List[str] = []

    # 1. Price analysis across all provided mandi quotes
    mandi_options: List[MandiOptionResult] = []
    for quote in payload.mandi_quotes:
        option_res = evaluate_mandi_pricing(quote, payload.quantity_kg)
        mandi_options.append(option_res)
        if option_res.conflicts_detected and option_res.conflict_note:
            warnings.append(f"[{option_res.mandi_name}] {option_res.conflict_note}")
        if "WARNING" in option_res.unit_note:
            warnings.append(f"[{option_res.mandi_name}] {option_res.unit_note}")

    if not mandi_options:
        raise HTTPException(status_code=400, detail="At least one valid mandi quotation must be supplied.")

    # 2. Rainfall risk assessment
    rainfall_res = evaluate_rainfall_risk(payload.rainfall_forecast, payload.decision_window_hours)
    if rainfall_res.is_missing:
        warnings.append("Weather alert: No rainfall forecast available. Operating in price-only comparison mode.")
    elif rainfall_res.is_stale:
        warnings.append(f"Weather alert: Rainfall forecast is stale ({rainfall_res.staleness_hours}h old). Elevated uncertainty.")

    # 3. Decision ranking and trade-offs
    recommended_option, tradeoff_summary = generate_tradeoff_summary(mandi_options, rainfall_res)

    # 4. Bilingual Brief Generation (Hindi & English)
    bilingual_brief = build_bilingual_brief(
        crop_name=payload.crop_name,
        village=payload.village or "Local Cluster",
        decision_window_hours=payload.decision_window_hours,
        options=mandi_options,
        recommended_option=recommended_option,
        rainfall=rainfall_res,
        tradeoff_summary=tradeoff_summary
    )

    return AnalysisResponse(
        analysis_id=analysis_id,
        analysis_timestamp=now_iso,
        crop_name=payload.crop_name,
        village=payload.village or "Local Cluster",
        decision_window_hours=payload.decision_window_hours,
        quantity_kg=payload.quantity_kg,
        mandi_options=mandi_options,
        rainfall_assessment=rainfall_res,
        recommended_option=recommended_option,
        tradeoff_summary=tradeoff_summary,
        warnings=warnings,
        bilingual_brief=bilingual_brief,
        is_demo_data=True,
        synthetic_data_disclaimer=DEMO_DISCLAIMER,
        farmer_autonomy_disclaimer=FARMER_DISCLAIMER
    )

@app.post("/price-bands")
def calculate_price_bands(payload: PriceBandsRequest):
    """
    Utility endpoint to compute net realization bands given gross prices and transport parameters.
    """
    g_min = payload.gross_price_per_kg
    g_max = payload.gross_price_per_kg
    if payload.gross_price_range and len(payload.gross_price_range) == 2:
        g_min = min(payload.gross_price_range)
        g_max = max(payload.gross_price_range)

    if g_min is None or g_max is None:
        raise HTTPException(status_code=400, detail="Gross price or gross price range is required.")

    cost_per_kg, display, note = calculate_transport_cost_per_kg(
        payload.transport_cost_per_kg,
        payload.transport_total_cost,
        payload.quantity_kg,
        distance_km=25.0
    )

    net_min = round(max(0.0, g_min - cost_per_kg), 2)
    net_max = round(max(0.0, g_max - cost_per_kg), 2)

    return {
        "gross_min": g_min,
        "gross_max": g_max,
        "transport_cost_per_kg": cost_per_kg,
        "transport_display": display,
        "net_min": net_min,
        "net_max": net_max,
        "net_display": f"₹{net_min:.2f} - ₹{net_max:.2f}/kg" if net_min != net_max else f"₹{net_min:.2f}/kg",
        "note": note
    }

@app.post("/rainfall-risk", response_model=RainfallAssessment)
def check_rainfall_risk(forecast: Optional[RainfallForecastInput] = None):
    """
    Standalone risk evaluation for short-term rainfall inputs.
    """
    return evaluate_rainfall_risk(forecast)
