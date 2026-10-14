from typing import Optional, Tuple
from datetime import datetime, timezone
from .schemas import RainfallForecastInput, RainfallAssessment

def evaluate_rainfall_risk(
    forecast: Optional[RainfallForecastInput],
    decision_window_hours: int = 36
) -> RainfallAssessment:
    """
    Evaluates rainfall risk against the 24-48h harvest decision window.
    Applies strict uncertainty safeguards:
    - Missing weather -> Falls back to price-only analysis with explicit alert.
    - Stale weather (>12h old) -> Flags high uncertainty.
    - Transparent deterministic risk boundaries (Low, Moderate, High).
    - NEVER claims guaranteed weather predictions.
    """
    if forecast is None:
        return RainfallAssessment(
            status="UNKNOWN",
            label="Weather Data Unavailable",
            rainfall_amount_mm=None,
            window_hours=decision_window_hours,
            forecast_source=None,
            forecast_timestamp=None,
            is_stale=False,
            is_missing=True,
            staleness_hours=None,
            advice="No short-term rainfall forecast supplied. Operating in price-only analysis mode. "
                   "Farmers are advised to consult local weather boards, radio forecasts, or extension workers before cutting standing crops."
        )

    amount = forecast.expected_rainfall_mm
    window = forecast.window_hours or decision_window_hours
    source = forecast.forecast_source or "IMD Agrometeorological Bulletin (Synthetic Demo)"
    timestamp = forecast.forecast_timestamp or datetime.now(timezone.utc).isoformat()
    
    # Check staleness: if timestamp is provided or explicit note
    is_stale = False
    staleness_hours = None
    if "stale" in str(forecast.forecast_timestamp).lower() or "yesterday" in str(forecast.forecast_timestamp).lower():
        is_stale = True
        staleness_hours = 18.0
    elif forecast.forecast_timestamp:
        try:
            # Try to parse ISO timestamp
            dt = datetime.fromisoformat(forecast.forecast_timestamp.replace("Z", "+00:00"))
            # If difference > 12 hours from reference
            now = datetime.now(timezone.utc)
            diff_hours = (now - dt).total_seconds() / 3600.0
            if diff_hours > 12.0:
                is_stale = True
                staleness_hours = round(diff_hours, 1)
        except Exception:
            pass

    # Risk category calculation
    if amount <= 2.0:
        status = "LOW_RISK"
        label = "Dry / Clear Sky (Low Rainfall Risk)"
        advice = (
            f"Favorable {window}-hour weather window. Minimal precipitation predicted ({amount:.1f} mm). "
            f"Harvest and transport conditions are suitable for standard open trolley haulage."
        )
    elif amount <= 10.0:
        status = "MODERATE_RISK"
        label = "Showers Expected (Moderate Moisture Risk)"
        advice = (
            f"Light to moderate showers predicted ({amount:.1f} mm in {window}h). "
            f"Cover trolley with waterproof tarpaulin (tirpal) during transport. "
            f"Harvest immediately only if crop moisture is within acceptable threshold (under 12-14%)."
        )
    else:
        status = "HIGH_RISK"
        label = "Heavy Rain / Waterlogging Alert (High Risk)"
        advice = (
            f"Significant rainfall expected ({amount:.1f} mm in {window}h). "
            f"Severe risk of grain spoilage, open yard flooding at distant mandis, and road delays. "
            f"Prioritize nearest mandi to minimize transit exposure, or postpone harvest if crop lodging is not imminent."
        )

    if is_stale:
        label = f"{label} [STALE FORECAST]"
        advice = f"WARNING: Weather forecast is over 12 hours old ({staleness_hours or '>12'}h). " + advice

    return RainfallAssessment(
        status=status,
        label=label,
        rainfall_amount_mm=amount,
        window_hours=window,
        forecast_source=source,
        forecast_timestamp=timestamp,
        is_stale=is_stale,
        is_missing=False,
        staleness_hours=staleness_hours,
        advice=advice
    )
