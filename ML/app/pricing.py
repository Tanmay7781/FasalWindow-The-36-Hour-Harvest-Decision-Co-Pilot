from typing import List, Tuple, Dict, Any, Optional
from .schemas import MandiQuoteInput, MandiOptionResult

def calculate_transport_cost_per_kg(
    transport_cost_per_kg: Optional[float],
    transport_total_cost: Optional[float],
    quantity_kg: Optional[float],
    distance_km: float
) -> Tuple[float, str, Optional[str]]:
    """
    Computes transport cost in INR/kg while strictly enforcing unit consistency.
    Returns: (cost_per_kg, display_string, warning_or_note)
    """
    # 1. Direct per-kg cost specified
    if transport_cost_per_kg is not None and transport_cost_per_kg > 0:
        return (
            round(transport_cost_per_kg, 2),
            f"₹{transport_cost_per_kg:.2f}/kg",
            "Provided directly as per-kg rate"
        )
    
    # 2. Total trip cost specified with quantity
    if transport_total_cost is not None and transport_total_cost > 0:
        if quantity_kg is not None and quantity_kg > 0:
            calc_rate = round(transport_total_cost / quantity_kg, 2)
            return (
                calc_rate,
                f"₹{calc_rate:.2f}/kg",
                f"Calculated from total trip cost (₹{transport_total_cost:.0f}) for {quantity_kg:.0f} kg lot"
            )
        else:
            # Cannot convert total trip cost to per-kg without quantity
            # Fall back to a standard distance benchmark (e.g. ₹0.08 per km per kg) with explicit alert
            approx_rate = round(0.08 * distance_km, 2)
            return (
                approx_rate,
                f"₹{approx_rate:.2f}/kg (Est.)",
                f"WARNING: Total trip cost ₹{transport_total_cost:.0f} was supplied without lot size (kg). "
                f"Estimated transport based on {distance_km} km distance at standard benchmark ₹0.08/km/kg."
            )
            
    # 3. Default distance-based benchmark: roughly ₹0.08 to ₹0.10 per km per kg for tractor-trolley
    calc_rate = round(max(0.50, distance_km * 0.08), 2)
    return (
        calc_rate,
        f"₹{calc_rate:.2f}/kg",
        f"Estimated using standard regional haulage rate ₹0.08/km/kg across {distance_km} km"
    )

def evaluate_mandi_pricing(
    quote: MandiQuoteInput,
    lot_quantity_kg: Optional[float] = None
) -> MandiOptionResult:
    """
    Evaluates pricing for a single mandi, handling single quotes, ranges,
    conflicting quotes, and transport unit deduction.
    """
    conflicts_detected = False
    conflict_notes = []

    # 1. Determine gross price bounds
    if quote.gross_price_range and len(quote.gross_price_range) == 2:
        g_min = float(min(quote.gross_price_range))
        g_max = float(max(quote.gross_price_range))
        is_range = True
    elif quote.gross_price_per_kg is not None:
        g_min = float(quote.gross_price_per_kg)
        g_max = float(quote.gross_price_per_kg)
        is_range = False
    else:
        # Default fallback if no price entered
        g_min = 20.0
        g_max = 20.0
        is_range = False

    # 2. Check for conflicting secondary quotes
    if quote.conflicting_quotes and len(quote.conflicting_quotes) > 0:
        conflicts_detected = True
        all_quotes = [g_min, g_max] + [float(q) for q in quote.conflicting_quotes]
        lowest_quote = min(all_quotes)
        highest_quote = max(all_quotes)
        
        # If difference exceeds 10%, flag quotation conflict
        spread_pct = ((highest_quote - lowest_quote) / lowest_quote) * 100
        if spread_pct > 10.0:
            conflict_notes.append(
                f"Conflicting quotations detected: Sources differ between ₹{lowest_quote:.2f} and "
                f"₹{highest_quote:.2f} ({spread_pct:.1f}% spread). Preserving full range without averaging."
            )
            # Expand range rather than silently averaging
            g_min = lowest_quote
            g_max = highest_quote
            is_range = True

    # 3. Transport cost calculation
    transport_per_kg, transport_display, unit_note = calculate_transport_cost_per_kg(
        quote.transport_cost_per_kg,
        quote.transport_total_cost,
        lot_quantity_kg,
        quote.distance_km
    )

    # 4. Net realization calculation: Net = Gross - Transport
    net_min = round(max(0.0, g_min - transport_per_kg), 2)
    net_max = round(max(0.0, g_max - transport_per_kg), 2)
    net_rep = round((net_min + net_max) / 2.0, 2)

    # Display strings
    if is_range:
        gross_display = f"₹{g_min:.2f} - ₹{g_max:.2f}/kg"
        net_display = f"₹{net_min:.2f} - ₹{net_max:.2f}/kg"
    else:
        gross_display = f"₹{g_min:.2f}/kg"
        net_display = f"₹{net_rep:.2f}/kg"

    # Freshness
    freshness = "FRESH"
    if quote.quote_timestamp:
        # If timestamp is old, mark STALE
        if "yesterday" in quote.quote_timestamp.lower() or "stale" in quote.quote_timestamp.lower():
            freshness = "STALE"

    return MandiOptionResult(
        mandi_name=quote.mandi_name,
        distance_km=quote.distance_km,
        gross_price_display=gross_display,
        gross_min=g_min,
        gross_max=g_max,
        transport_cost_per_kg=transport_per_kg,
        transport_cost_display=transport_display,
        net_realization_display=net_display,
        net_min=net_min,
        net_max=net_max,
        net_representative=net_rep,
        is_range=is_range,
        quote_freshness_status=freshness,
        quote_source=quote.quote_source or "APMC Agmarknet",
        quote_timestamp=quote.quote_timestamp or "Today morning",
        conflicts_detected=conflicts_detected,
        conflict_note=" | ".join(conflict_notes) if conflict_notes else None,
        unit_note=unit_note
    )
