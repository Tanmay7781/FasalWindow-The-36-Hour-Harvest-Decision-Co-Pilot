from typing import List, Tuple, Dict, Any, Optional
from .schemas import (
    MandiOptionResult,
    RainfallAssessment,
    DecisionBriefContent,
    BilingualBrief
)

def generate_tradeoff_summary(
    options: List[MandiOptionResult],
    rainfall: RainfallAssessment
) -> Tuple[Optional[MandiOptionResult], str]:
    """
    Ranks mandi options and produces a clear trade-off narrative.
    Balances net realization against transport distance and rainfall vulnerability.
    """
    if not options:
        return None, "Insufficient data to formulate selling options."

    # Sort options primarily by representative net realization descending
    sorted_options = sorted(options, key=lambda x: x.net_representative, reverse=True)
    best_net_option = sorted_options[0]

    # Find highest gross option
    highest_gross_option = max(options, key=lambda x: x.gross_max)

    # Find closest mandi
    closest_option = min(options, key=lambda x: x.distance_km)

    tradeoff_parts = []

    # Check if highest gross is different from highest net
    if highest_gross_option.mandi_name != best_net_option.mandi_name:
        tradeoff_parts.append(
            f"Note: {highest_gross_option.mandi_name} quotes the highest gross price ({highest_gross_option.gross_price_display}), "
            f"but after ₹{highest_gross_option.transport_cost_per_kg:.2f}/kg haulage deduction, "
            f"{best_net_option.mandi_name} delivers a higher net return ({best_net_option.net_realization_display} vs {highest_gross_option.net_realization_display})."
        )
    else:
        tradeoff_parts.append(
            f"{best_net_option.mandi_name} offers the strongest net realization ({best_net_option.net_realization_display}) "
            f"after factoring ₹{best_net_option.transport_cost_per_kg:.2f}/kg in transport cost."
        )

    # Check rainfall impact on decision
    recommended_option = best_net_option
    if rainfall.status == "HIGH_RISK" and closest_option.mandi_name != best_net_option.mandi_name:
        dist_diff = best_net_option.distance_km - closest_option.distance_km
        if dist_diff > 20:
            tradeoff_parts.append(
                f"Rainfall Trade-off Alert: Heavy rainfall predicted ({rainfall.rainfall_amount_mm or 0:.1f} mm). "
                f"Although {best_net_option.mandi_name} yields higher net price, it is {dist_diff:.0f} km farther away than {closest_option.mandi_name}. "
                f"Farmers should weigh transit spoilage risk against the ₹{best_net_option.net_representative - closest_option.net_representative:.2f}/kg net premium."
            )

    return recommended_option, " ".join(tradeoff_parts)

def build_bilingual_brief(
    crop_name: str,
    village: str,
    decision_window_hours: int,
    options: List[MandiOptionResult],
    recommended_option: Optional[MandiOptionResult],
    rainfall: RainfallAssessment,
    tradeoff_summary: str
) -> BilingualBrief:
    """
    Constructs deterministic bilingual (Hindi & English) briefs.
    Ensures zero reliance on third-party LLM APIs for core offline reliability.
    """
    best_name = recommended_option.mandi_name if recommended_option else "N/A"
    best_net = recommended_option.net_realization_display if recommended_option else "N/A"
    best_gross = recommended_option.gross_price_display if recommended_option else "N/A"
    best_trans = recommended_option.transport_cost_display if recommended_option else "N/A"
    best_dist = f"{recommended_option.distance_km:.0f} km" if recommended_option else "N/A"

    options_summary_en = "; ".join([
        f"{opt.mandi_name} ({opt.distance_km}km): Gross {opt.gross_price_display}, Haulage {opt.transport_cost_display} -> Net {opt.net_realization_display}"
        for opt in options
    ])

    options_summary_hi = "; ".join([
        f"{opt.mandi_name} ({opt.distance_km} किमी): भाव {opt.gross_price_display}, ढुलाई {opt.transport_cost_display} -> शुद्ध आय {opt.net_realization_display}"
        for opt in options
    ])

    # English Brief
    en_brief = DecisionBriefContent(
        headline=f"36-Hour Harvest & Selling Decision Brief for {crop_name} ({village})",
        primary_recommendation=(
            f"Recommended primary option is {best_name} ({best_dist}) with estimated net realization of "
            f"{best_net} (Gross {best_gross} minus {best_trans} transport)."
        ),
        key_tradeoff=tradeoff_summary,
        weather_alert=(
            f"Weather Status: {rainfall.label}. {rainfall.advice}"
        ),
        action_steps=[
            f"Confirm current arrival gates and bag weights at {best_name} before loading.",
            f"Secure waterproof cover (tirpal) on the tractor/tempo regardless of light clouds.",
            f"Verify moisture meter reading with local FPO aggregator prior to harvesting standing crop.",
            f"Compare quotes: {options_summary_en}."
        ],
        unknowns_and_uncertainties=[
            "Market prices fluctuate throughout the trading day and are not guaranteed.",
            "Weather forecasts represent probability estimates based on regional stations.",
            "Transport costs assume standard dry-road transit times without monsoon diversions."
        ],
        fpo_verification_checklist=[
            "1. Ask FPO secretary if collective transport pooling is available for this route.",
            "2. Inquire about current commission agent cut or unloading fees at the target mandi.",
            "3. Confirm if direct farm-gate procurement is scheduled this week."
        ],
        disclaimer="FasalWindow is an advisory decision-support co-pilot. The final harvest timing and selling location decision remains entirely with the farmer."
    )

    # Hindi Brief
    hi_brief = DecisionBriefContent(
        headline=f"{crop_name} के लिए 36-घंटे का कटाई एवं मंडी विक्रय निर्णय पत्र ({village})",
        primary_recommendation=(
            f"प्राथमिक अनुशंसित विकल्प: {best_name} ({best_dist}), जहां अनुमानित शुद्ध आय "
            f"{best_net} है (मंडी भाव {best_gross} में से {best_trans} ढुलाई घटाकर)।"
        ),
        key_tradeoff=(
            f"तुलनात्मक विश्लेषण: केवल सबसे ऊंचे मंडी भाव पर न जाएं, ढुलाई खर्च घटाने के बाद शुद्ध बचत देखें। "
            f"{best_name} में शुद्ध लाभ सबसे बेहतर रहने की संभावना है।"
        ),
        weather_alert=(
            f"मौसम स्थिति: {rainfall.label}। {rainfall.advice}"
        ),
        action_steps=[
            f"फसल लोड करने से पहले {best_name} में आज की आवक और बोली की पुष्टि करें।",
            f"ट्रैक्टर/ट्रॉली पर तिरपाल (वाटरप्रूफ कवर) अवश्य बांधें।",
            f"कटाई से पहले स्थानीय एफपीओ (FPO) या कृषि मित्र से दाने की नमी अवश्य जांचें।",
            f"उपलब्ध मंडियां: {options_summary_hi}।"
        ],
        unknowns_and_uncertainties=[
            "मंडी में अंतिम बोली नीलामी के समय तय होती है, यह कोई गारंटीशुदा मूल्य नहीं है।",
            "मौसम का पूर्वानुमान एक संभाव्यता अनुमान है, अप्रत्याशित वर्षा संभव है।",
            "ढुलाई दरें सड़क की स्थिति और लोड के आधार पर भिन्न हो सकती हैं।"
        ],
        fpo_verification_checklist=[
            "1. अपने FPO प्रबंधक से पूछें कि क्या सामूहिक ढुलाई (शेयरिंग) की सुविधा उपलब्ध है।",
            "2. लक्षित मंडी में आज के हम्माली व तुलाई शुल्क की जानकारी लें।",
            "3. जांचें कि क्या इस सप्ताह गांव में ही खेत-पर-खरीद (Farmgate) की योजना है।"
        ],
        disclaimer="फसलविंडो (FasalWindow) एक निर्णय-सहायक प्रणाली है। कटाई और बिक्री का अंतिम निर्णय पूरी तरह किसान भाई का अपना है।"
    )

    return BilingualBrief(hi=hi_brief, en=en_brief)
