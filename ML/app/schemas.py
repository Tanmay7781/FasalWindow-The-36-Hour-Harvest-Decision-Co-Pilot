from typing import List, Optional, Tuple, Dict, Any
from pydantic import BaseModel, Field, model_validator
from datetime import datetime

class MandiQuoteInput(BaseModel):
    mandi_name: str = Field(..., description="Name of the mandi (market)")
    distance_km: float = Field(..., ge=0, description="Road distance from village in kilometers")
    gross_price_per_kg: Optional[float] = Field(None, ge=0, description="Single gross quoted price in INR/kg")
    gross_price_range: Optional[List[float]] = Field(None, description="[min, max] range in INR/kg")
    quote_source: Optional[str] = Field("APMC Agmarknet", description="Source of quote")
    quote_timestamp: Optional[str] = Field(None, description="ISO timestamp or string when quote was observed")
    conflicting_quotes: Optional[List[float]] = Field(None, description="Alternative quotes observed from traders/sources")
    transport_cost_per_kg: Optional[float] = Field(None, ge=0, description="Transportation cost in INR/kg")
    transport_total_cost: Optional[float] = Field(None, ge=0, description="Total trip transport cost in INR")

class RainfallForecastInput(BaseModel):
    expected_rainfall_mm: float = Field(..., ge=0, description="Forecasted rainfall in millimeters")
    window_hours: int = Field(36, ge=12, le=72, description="Forecast window duration in hours")
    forecast_timestamp: Optional[str] = Field(None, description="Timestamp when weather forecast was issued")
    forecast_source: Optional[str] = Field("IMD / Synthetic Agrometeorological Service", description="Weather forecast provider")
    confidence_note: Optional[str] = Field(None, description="Informational weather note")

class AnalysisRequest(BaseModel):
    crop_name: str = Field(..., min_length=2, description="Crop name (e.g. Wheat, Mustard, Soybean)")
    village: Optional[str] = Field("Gwalior Rural", description="Origin village or cluster name")
    decision_window_hours: int = Field(36, ge=12, le=72, description="Harvest decision window in hours (24, 36, 48)")
    quantity_kg: Optional[float] = Field(None, ge=0, description="Total quantity to sell in kilograms")
    mandi_quotes: List[MandiQuoteInput] = Field(..., min_length=1, description="List of 1 to 5 mandi quotations")
    rainfall_forecast: Optional[RainfallForecastInput] = Field(None, description="Short-term rainfall forecast if available")
    actor_id: Optional[str] = Field("Farmer Self", description="Identifier of the requester / extension agent")

class PriceBandsRequest(BaseModel):
    gross_price_per_kg: Optional[float] = None
    gross_price_range: Optional[List[float]] = None
    transport_cost_per_kg: Optional[float] = None
    transport_total_cost: Optional[float] = None
    quantity_kg: Optional[float] = None

class MandiOptionResult(BaseModel):
    mandi_name: str
    distance_km: float
    gross_price_display: str
    gross_min: float
    gross_max: float
    transport_cost_per_kg: float
    transport_cost_display: str
    net_realization_display: str
    net_min: float
    net_max: float
    net_representative: float
    is_range: bool
    quote_freshness_status: str
    quote_source: Optional[str] = None
    quote_timestamp: Optional[str] = None
    conflicts_detected: bool = False
    conflict_note: Optional[str] = None
    unit_note: str

class RainfallAssessment(BaseModel):
    status: str  # LOW_RISK, MODERATE_RISK, HIGH_RISK, UNKNOWN
    label: str
    rainfall_amount_mm: Optional[float] = None
    window_hours: Optional[int] = None
    forecast_source: Optional[str] = None
    forecast_timestamp: Optional[str] = None
    is_stale: bool = False
    is_missing: bool = False
    staleness_hours: Optional[float] = None
    advice: str

class DecisionBriefContent(BaseModel):
    headline: str
    primary_recommendation: str
    key_tradeoff: str
    weather_alert: str
    action_steps: List[str]
    unknowns_and_uncertainties: List[str]
    fpo_verification_checklist: List[str]
    disclaimer: str

class BilingualBrief(BaseModel):
    hi: DecisionBriefContent
    en: DecisionBriefContent

class AnalysisResponse(BaseModel):
    analysis_id: str
    analysis_timestamp: str
    crop_name: str
    village: str
    decision_window_hours: int
    quantity_kg: Optional[float]
    mandi_options: List[MandiOptionResult]
    rainfall_assessment: RainfallAssessment
    recommended_option: Optional[MandiOptionResult]
    tradeoff_summary: str
    warnings: List[str]
    bilingual_brief: BilingualBrief
    is_demo_data: bool = True
    synthetic_data_disclaimer: str
    farmer_autonomy_disclaimer: str
