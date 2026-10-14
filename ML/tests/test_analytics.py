import pytest
from ML.app.schemas import (
    MandiQuoteInput,
    RainfallForecastInput,
    AnalysisRequest
)
from ML.app.pricing import evaluate_mandi_pricing, calculate_transport_cost_per_kg
from ML.app.rainfall_risk import evaluate_rainfall_risk
from ML.app.recommendations import generate_tradeoff_summary, build_bilingual_brief
from ML.app.main import app
from fastapi.testclient import TestClient

client = TestClient(app)

def test_net_price_calculation_exact():
    """Verifies Net Realization per kg = Gross Mandi Price per kg - Transport Cost per kg"""
    quote = MandiQuoteInput(
        mandi_name="Gwalior Main Mandi",
        distance_km=15.0,
        gross_price_per_kg=25.00,
        transport_cost_per_kg=1.50
    )
    result = evaluate_mandi_pricing(quote)
    assert result.net_min == 23.50
    assert result.net_max == 23.50
    assert result.net_representative == 23.50
    assert "₹23.50/kg" in result.net_realization_display

def test_price_range_preservation():
    """Verifies that price ranges [min, max] are preserved without averaging."""
    quote = MandiQuoteInput(
        mandi_name="Dabra Mandi",
        distance_km=30.0,
        gross_price_range=[24.00, 27.00],
        transport_cost_per_kg=2.00
    )
    result = evaluate_mandi_pricing(quote)
    assert result.is_range is True
    assert result.net_min == 22.00
    assert result.net_max == 25.00
    assert result.net_realization_display == "₹22.00 - ₹25.00/kg"

def test_conflicting_quotations_handling():
    """Verifies that conflicting secondary quotes expand range and flag warnings rather than silent averaging."""
    quote = MandiQuoteInput(
        mandi_name="Morena Mandi",
        distance_km=40.0,
        gross_price_per_kg=22.00,
        conflicting_quotes=[26.00],  # > 15% disparity
        transport_cost_per_kg=2.50
    )
    result = evaluate_mandi_pricing(quote)
    assert result.conflicts_detected is True
    assert result.gross_min == 22.00
    assert result.gross_max == 26.00
    assert result.net_min == 19.50
    assert result.net_max == 23.50
    assert "Conflicting quotations" in result.conflict_note

def test_transport_total_cost_requires_quantity():
    """Verifies that total trip cost converts accurately when quantity is supplied, or alerts when missing."""
    # When quantity is known: ₹1000 total trip for 500kg lot -> ₹2.00/kg
    cost_per_kg, display, note = calculate_transport_cost_per_kg(
        transport_cost_per_kg=None,
        transport_total_cost=1000.0,
        quantity_kg=500.0,
        distance_km=25.0
    )
    assert cost_per_kg == 2.00
    assert display == "₹2.00/kg"

    # When quantity is missing: must warn user rather than silent guessing
    cost_per_kg, display, note = calculate_transport_cost_per_kg(
        transport_cost_per_kg=None,
        transport_total_cost=1000.0,
        quantity_kg=None,
        distance_km=25.0
    )
    assert "WARNING" in note

def test_missing_weather_fallback():
    """Verifies fallback to price-only analysis when weather forecast is None."""
    assessment = evaluate_rainfall_risk(None, decision_window_hours=36)
    assert assessment.is_missing is True
    assert assessment.status == "UNKNOWN"
    assert "price-only" in assessment.advice.lower()

def test_stale_weather_warning():
    """Verifies that stale weather forecasts (>12h old or marked stale) trigger alerts."""
    forecast = RainfallForecastInput(
        expected_rainfall_mm=8.0,
        forecast_timestamp="2026-10-13T06:00:00Z"  # >12h old relative to now
    )
    assessment = evaluate_rainfall_risk(forecast, decision_window_hours=36)
    assert assessment.is_stale is True
    assert "STALE" in assessment.label

def test_fastapi_analyze_endpoint():
    """E2E test of the /analyze endpoint including bilingual brief and disclaimers."""
    payload = {
        "crop_name": "Wheat (Sharbati)",
        "village": "Piproli Village, Gwalior",
        "decision_window_hours": 36,
        "quantity_kg": 2000,
        "mandi_quotes": [
            {
                "mandi_name": "Gwalior APMC",
                "distance_km": 12.0,
                "gross_price_per_kg": 24.50,
                "transport_cost_per_kg": 1.20
            },
            {
                "mandi_name": "Dabra Mandi",
                "distance_km": 35.0,
                "gross_price_range": [26.00, 27.50],
                "transport_cost_per_kg": 2.80
            }
        ],
        "rainfall_forecast": {
            "expected_rainfall_mm": 4.5,
            "window_hours": 36,
            "forecast_source": "IMD District Agro Advisory"
        }
    }
    response = client.post("/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["crop_name"] == "Wheat (Sharbati)"
    assert len(data["mandi_options"]) == 2
    assert "bilingual_brief" in data
    assert "hi" in data["bilingual_brief"]
    assert "en" in data["bilingual_brief"]
    # Check disclaimers and synthetic data notice
    assert data["is_demo_data"] is True
    assert "DEMO NOTICE" in data["synthetic_data_disclaimer"]
    assert "farmer retains full autonomy" in data["farmer_autonomy_disclaimer"].lower()
