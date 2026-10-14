# FasalWindow Wireframes Specification
**The 36-Hour Harvest & Selling Decision Co-Pilot**

This document details the visual layouts and functional wireframes for all principal user screens in FasalWindow.

---

## Screen 1: Farmer Dashboard & Main Shell

**Purpose:** Serves as the primary operational hub for farmers, extension officers (Kisan Mitras), and FPO coordinators. Shows real-time connectivity indicators, quick scenario testing triggers, and top-level navigation.

```text
+----------------------------------------------------------------------------------------------------+
| 🌾 FasalWindow [36h Co-Pilot]       Demo Scenarios: [1: Price/Transport] [2: Rain] [3: Spread]    |
| फ़सलविंडो — कटाई एवं मंडी निर्णय       Status: [● API Online] [● FastAPI (ML)] [● DB Connected]     |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|  +----------------------------------------------------------------------------------------------+  |
|  | HERO BANNER: The 36-Hour Harvest Decision Co-Pilot for Smallholder Farmers                    |  |
|  | Compare mandi rates after haulage deductions, assess short-term rainfall spoilage hazards,    |  |
|  | and generate uncertainty-aware Hindi/English briefs. Works offline with audit overrides.    |  |
|  | [✓ Net Realization Focus]    [✓ Uncertainty Safeguards]    [✓ Zero Fake AI Guarantees]        |  |
|  +----------------------------------------------------------------------------------------------+  |
|                                                                                                    |
|  [ HARVEST INPUT FORM ]                                                                            |
|                                                                                                    |
|  [ WARNING & UNCERTAINTY BANNERS ]                                                                 |
|                                                                                                    |
|  [ MANDI NET REALIZATION COMPARISON CARDS ]                                                        |
|                                                                                                    |
|  [ SHORT-TERM RAINFALL RISK METER ]                                                                |
|                                                                                                    |
|  [ BILINGUAL DECISION BRIEF (HINDI / ENGLISH TABS) ]                                               |
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+
| Footer: FasalWindow Advisory Co-Pilot • IIIT Gwalior Hackathon Prototype • Synthetic Demo Data    |
+----------------------------------------------------------------------------------------------------+
```

---

## Screen 2: Crop, Mandi, Transport & Weather Input Form

**Purpose:** Captures verified field parameters: crop variety, harvest window, total lot size in kg/quintals, 2 to 3 candidate mandis (single price or [min, max] range), transport costs, and short-term precipitation estimates.

```text
+----------------------------------------------------------------------------------------------------+
| HARVEST & MARKET PARAMETERS                                                       [✓ Offline Ready]|
+----------------------------------------------------------------------------------------------------+
| Crop Selection:                  Origin Village / Cluster:            Decision Window:             |
| [ Wheat (Sharbati / Lokwan)  v ] [ Piproli Village, Gwalior         ]  [ (24h) | (36h)* | (48h) ]   |
+----------------------------------------------------------------------------------------------------+
| Lot Quantity (kg):               Notes:                                                            |
| [ 2500                        ]  Supplying lot weight enables exact per-kg haulage conversion.     |
+----------------------------------------------------------------------------------------------------+
| CANDIDATE MANDIS & HAULAGE COSTS                                                    [+ Add Mandi]  |
|                                                                                                    |
| +-- Option 1: Gwalior Laxmiganj APMC ------------------------------------------------------------+ |
| | Distance (km): [ 14.5 ]  | Gross Price: [ Single Rate: ₹24.50/kg ] | Haulage Rate: [ ₹1.20/kg ] | |
| | Source: [ APMC Daily Board ]   | Observed: [ Today morning ]                                   | |
| +------------------------------------------------------------------------------------------------+ |
|                                                                                                    |
| +-- Option 2: Dabra Krishi Mandi ----------------------------------------------------------------+ |
| | Distance (km): [ 38.0 ]  | Gross Price: [ Range: Min ₹26.00  Max ₹27.50 ] | Haulage: [ ₹2.80/kg]| |
| | Source: [ Trade Commission ]   | Observed: [ Today morning ]                                   | |
| +------------------------------------------------------------------------------------------------+ |
+----------------------------------------------------------------------------------------------------+
| SHORT-TERM RAINFALL FORECAST (36h Window)                       [X] Include Weather in Analysis    |
| Expected Rainfall (mm):     Weather Provider / Station:         Forecast Age / Freshness:          |
| [ 3.5                     ] [ IMD Gwalior Agro Bulletin       ] [ Fresh (Today <6h ago)          v]|
+----------------------------------------------------------------------------------------------------+
| [ ⚡ ANALYSE 36-HOUR HARVEST & SELLING OPTIONS ]                                                   |
+----------------------------------------------------------------------------------------------------+
```

---

## Screen 3: Mandi Comparison & Analysis Results

**Purpose:** Visualizes gross price versus net realization in INR/kg. Highlights that the highest gross price mandi is not necessarily the most profitable after transit deductions.

```text
+----------------------------------------------------------------------------------------------------+
| MANDI QUOTATION & NET REALIZATION COMPARISON                               Showing 2 Market Options|
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
| +----------------------------------------+     +----------------------------------------+          |
| | Gwalior Laxmiganj APMC   [14.5 km]     |     | Dabra Krishi Mandi       [38.0 km]     |          |
| | [★ HIGHEST NET REALIZATION]    [FRESH] |     |                          [FRESH]       |          |
| |                                        |     |                                        |          |
| | ESTIMATED NET REALIZATION:             |     | ESTIMATED NET REALIZATION:             |          |
| |   ₹23.30 / kg                          |     |   ₹23.20 - ₹24.70 / kg                 |          |
| |   (Actual in-pocket realization)       |     |   (Actual in-pocket realization)       |          |
| |                                        |     |                                        |          |
| | Gross Quoted Price:       ₹24.50 / kg  |     | Gross Quoted Price:    ₹26.00-27.50/kg |          |
| | Transport Haulage:      - ₹1.20 / kg   |     | Transport Haulage:     - ₹2.80 / kg    |          |
| |                                        |     |                                        |          |
| | Source: APMC Board (Today morning)     |     | Source: Trader Quote (Today morning)   |          |
| |                                        |     |                                        |          |
| | [ Select for Human Override -> ]       |     | [ Select for Human Override -> ]       |          |
| +----------------------------------------+     +----------------------------------------+          |
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+
```

---

## Screen 4: Short-Term Rainfall Risk Card

**Purpose:** Communicates moisture and spoilage threats transparently without fabricated meteorology claims. Distinguishes dry, light showers, heavy rain, stale forecasts, and missing data.

```text
+----------------------------------------------------------------------------------------------------+
| [🌧️] SHOWERS EXPECTED (MODERATE MOISTURE RISK)                        3.5 mm Predicted in 36h      |
+----------------------------------------------------------------------------------------------------+
| AGRICULTURAL ADVISORY:                                                                             |
| Light to moderate showers predicted (3.5 mm in 36h). Cover trolley with waterproof tarpaulin       |
| (tirpal) during transit. Harvest standing crop only if grain moisture is verified under 12-14%.    |
|                                                                                                    |
| Source: IMD Agro Advisory Bulletin (Synthetic Demo)   •   Issued: Today morning                    |
+----------------------------------------------------------------------------------------------------+
```

---

## Screen 5: Hindi & English Decision Brief

**Purpose:** Provides an actionable, deterministic summary for extension workers and farmers in Hindi and English. Explains the key trade-off, action steps, unknowns, and FPO verification points.

```text
+----------------------------------------------------------------------------------------------------+
| DECISION BRIEF / निर्णय पत्र                                              [ हिंदी (Hindi)* ] [ English ]  |
+----------------------------------------------------------------------------------------------------+
| +-- मुख्य सिफ़ारिश (Primary Recommendation) -----------------------------------------------------+ |
| | प्राथमिक अनुशंसित विकल्प: Gwalior Laxmiganj APMC (14.5 किमी), जहां अनुमानित शुद्ध आय              | |
| | ₹23.30/kg है (मंडी भाव ₹24.50 में से ₹1.20 ढुलाई घटाकर)।                                       | |
| +------------------------------------------------------------------------------------------------+ |
|                                                                                                    |
| व्यापारिक समझ व तुलना: केवल सबसे ऊंचे मंडी भाव पर न जाएं, ढुलाई खर्च घटाने के बाद शुद्ध बचत देखें।   |
| Dabra में भाव ₹27.50 तक है लेकिन ₹2.80 ढुलाई के बाद शुद्ध आय Gwalior के बराबर या कम रह सकती है।       |
|                                                                                                    |
| [ किसान के लिए अनुशंसित कदम ]               [ FPO / कृषि मित्र सत्यापन चेकलिस्ट ]                  |
|  ✓ ट्रैक्टर पर तिरपाल (वाटरप्रूफ) अवश्य बांधें।  • सामूहिक ढुलाई (ट्रॉली पूलिंग) की उपलब्धता जांचें। |
|  ✓ कटाई से पहले दाने की नमी अवश्य मापें।     • आज की तुलाई व हम्माली दर की पुष्टि करें।             |
|                                                                                                    |
| [!] अनिश्चितताएं: मंडी में अंतिम बोली नीलामी के समय तय होती है। मौसम पूर्वानुमान संभाव्यता है।      |
|                                                                                                    |
| * अस्वीकरण: फसलविंडो एक निर्णय-सहायक प्रणाली है। कटाई और बिक्री का अंतिम निर्णय किसान भाई का अपना है।*|
+----------------------------------------------------------------------------------------------------+
```

---

## Screen 6: Cached / Stale Data State

**Purpose:** Explicitly alerts the farmer when operating offline or reviewing a previous advisory result so outdated market prices are never mistaken for live quotes.

```text
+----------------------------------------------------------------------------------------------------+
| [🗄️] OFFLINE / CACHED ANALYSIS DISPLAYED                              [ NOT LIVE DATA ]             |
| Generated at 10:45 AM (Oct 14, 2026). Displaying last verified advisory preserved from storage.     |
| Note: Market prices fluctuate throughout the trading day. Please verify before traveling.          |
|                                                                         [ 🔄 Try Re-syncing ]      |
+----------------------------------------------------------------------------------------------------+
```

---

## Screen 7: Human Override & Audit Modal

**Purpose:** Enables extension workers or farmers to select an alternative market with a mandatory recorded field reason, maintaining trust and auditable decision history.

```text
+--------------------------------------------------------------------------------+
| HUMAN DECISION OVERRIDE & AUDIT LOG                                        [X] |
+--------------------------------------------------------------------------------+
| Algorithmic Recommendation: Gwalior Laxmiganj APMC (₹23.30/kg net)             |
+--------------------------------------------------------------------------------+
| Chosen Alternative Mandi:                                                      |
| [ Dabra Krishi Mandi                                                         ] |
|                                                                                |
| Actor / Extension Agent Name:                                                  |
| [ Ramesh Kumar (FPO Coordinator)                                             ] |
|                                                                                |
| Field Override Reason * (Mandatory):                                           |
| [ Highway culvert towards Gwalior has severe waterlogging; Dabra highway is   ]|
| [ dry and open. Farmer also has prior credit tie-up with Dabra agent.        ] |
|                                                                                |
| [ Cancel ]                                         [ Confirm & Log Override ]  |
+--------------------------------------------------------------------------------+
```
