import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CachedIndicator from './components/CachedIndicator';
import WarningBanner from './components/WarningBanner';
import HarvestInputForm from './components/HarvestInputForm';
import MandiComparison from './components/MandiComparison';
import RainfallRiskCard from './components/RainfallRiskCard';
import DecisionBrief from './components/DecisionBrief';
import HumanOverrideModal from './components/HumanOverrideModal';
import {
  fetchHealth,
  fetchCrops,
  fetchMandis,
  submitAnalysis,
  submitHumanOverride,
  getFromLocalCache,
  getOfflineOverrides
} from './services/api';
import { Sparkles, Sprout, ShieldCheck, HelpCircle } from 'lucide-react';

const INITIAL_FORM_DATA = {
  crop_name: 'Wheat (Sharbati / Lokwan)',
  village: 'Piproli Village, Gwalior',
  decision_window_hours: 36,
  quantity_kg: 2500,
  mandi_quotes: [
    {
      mandi_name: 'Gwalior Laxmiganj Krishi Upaj Mandi',
      distance_km: 14.5,
      gross_price_per_kg: 24.5,
      is_range: false,
      gross_price_range: null,
      transport_cost_per_kg: 1.20,
      quote_source: 'APMC Agmarknet Board',
      quote_timestamp: 'Today morning'
    },
    {
      mandi_name: 'Dabra Krishi Upaj Mandi',
      distance_km: 38.0,
      gross_price_per_kg: null,
      is_range: true,
      gross_price_range: [26.0, 27.5],
      transport_cost_per_kg: 2.80,
      quote_source: 'Dabra Trade Commission Quote',
      quote_timestamp: 'Today morning'
    },
    {
      mandi_name: 'Morena Mandi Samiti',
      distance_km: 44.0,
      gross_price_per_kg: 23.8,
      is_range: false,
      gross_price_range: null,
      transport_cost_per_kg: 3.20,
      quote_source: 'Morena Portal',
      quote_timestamp: 'Today morning'
    }
  ],
  rainfall_forecast: {
    expected_rainfall_mm: 3.5,
    window_hours: 36,
    forecast_source: 'IMD Gwalior Agro Bulletin',
    forecast_timestamp: new Date().toISOString()
  },
  actor_id: 'Farmer Self'
};

export default function App() {
  const [crops, setCrops] = useState([]);
  const [mandis, setMandis] = useState([]);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // System status
  const [systemStatus, setSystemStatus] = useState({
    backend: 'ok',
    fastapi: 'healthy',
    database: false
  });

  // Offline simulation toggle
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Override modal state
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [selectedMandiForOverride, setSelectedMandiForOverride] = useState(null);
  const [recentOverrides, setRecentOverrides] = useState([]);

  // Check health and catalog on mount
  useEffect(() => {
    async function loadInitialData() {
      const health = await fetchHealth();
      setSystemStatus({
        backend: health.status === 'ok' ? 'ok' : 'down',
        fastapi: health.fastapi_service?.status === 'healthy' ? 'healthy' : 'down',
        database: health.database_connected || false
      });

      const loadedCrops = await fetchCrops();
      setCrops(loadedCrops);

      const loadedMandis = await fetchMandis();
      setMandis(loadedMandis);

      // Check if there is an existing cached analysis to display initially
      const cached = getFromLocalCache();
      if (cached) {
        setAnalysis({ ...cached, is_cached_fallback: true, cache_reason: 'Restored from previous session.' });
      }

      setRecentOverrides(getOfflineOverrides());
    }

    loadInitialData();
  }, []);

  // Analysis submission
  const handleAnalyze = async (payloadToAnalyze) => {
    setIsLoading(true);
    setError(null);

    // If simulated offline mode is on, bypass network and read from local cache
    if (isOfflineMode) {
      setTimeout(() => {
        const cached = getFromLocalCache();
        if (cached) {
          setAnalysis({
            ...cached,
            is_cached_fallback: true,
            cache_reason: 'Device in simulated offline mode. Showing cached analysis from storage.'
          });
        } else {
          setError('No cached analysis available on device while offline. Please connect to run your first analysis.');
        }
        setIsLoading(false);
      }, 400);
      return;
    }

    try {
      const result = await submitAnalysis(payloadToAnalyze);
      setAnalysis(result);
    } catch (err) {
      setError(err.message || 'Analysis could not be completed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Demo Scenarios Handler
  const handleSelectScenario = (scenarioKey) => {
    if (scenarioKey === 'scenario1') {
      // Scenario 1: Distant Mandi with High Gross vs High Transport
      const s1Data = {
        ...INITIAL_FORM_DATA,
        crop_name: 'Wheat (Sharbati / Lokwan)',
        mandi_quotes: [
          {
            mandi_name: 'Gwalior Laxmiganj APMC',
            distance_km: 14.5,
            gross_price_per_kg: 24.50,
            is_range: false,
            transport_cost_per_kg: 1.20,
            quote_source: 'Local Mandi Board',
            quote_timestamp: 'Today morning'
          },
          {
            mandi_name: 'Dabra Krishi Mandi (Distant High Quote)',
            distance_km: 42.0,
            gross_price_per_kg: 27.00, // High gross, but high transport
            is_range: false,
            transport_cost_per_kg: 4.20, // 27.00 - 4.20 = 22.80 net! Gwalior yields 23.30 net!
            quote_source: 'Regional Trader Quote',
            quote_timestamp: 'Today morning'
          }
        ],
        rainfall_forecast: {
          expected_rainfall_mm: 1.5,
          window_hours: 36,
          forecast_source: 'IMD Station',
          forecast_timestamp: new Date().toISOString()
        }
      };
      setFormData(s1Data);
      handleAnalyze(s1Data);
    } else if (scenarioKey === 'scenario2') {
      // Scenario 2: Heavy Rainfall Alert (>12mm)
      const s2Data = {
        ...INITIAL_FORM_DATA,
        crop_name: 'Mustard (Sarson)',
        mandi_quotes: [
          {
            mandi_name: 'Gwalior Laxmiganj APMC',
            distance_km: 14.0,
            gross_price_per_kg: 53.00,
            is_range: false,
            transport_cost_per_kg: 1.30,
            quote_source: 'APMC Daily Board',
            quote_timestamp: 'Today'
          },
          {
            mandi_name: 'Morena Mustard Hub',
            distance_km: 46.0,
            gross_price_per_kg: 56.00,
            is_range: false,
            transport_cost_per_kg: 3.80,
            quote_source: 'Morena Soya-Mustard Pool',
            quote_timestamp: 'Today'
          }
        ],
        rainfall_forecast: {
          expected_rainfall_mm: 16.5, // Heavy rain
          window_hours: 36,
          forecast_source: 'IMD Severe Weather Advisory (Synthetic Demo)',
          forecast_timestamp: new Date().toISOString()
        }
      };
      setFormData(s2Data);
      handleAnalyze(s2Data);
    } else if (scenarioKey === 'scenario3') {
      // Scenario 3: Conflicting Market Quotations
      const s3Data = {
        ...INITIAL_FORM_DATA,
        crop_name: 'Soybean (Yellow)',
        mandi_quotes: [
          {
            mandi_name: 'Morena Mandi Samiti',
            distance_km: 40.0,
            gross_price_per_kg: 42.00,
            conflicting_quotes: [47.50], // >12% spread
            is_range: false,
            transport_cost_per_kg: 3.00,
            quote_source: 'Commission Agent vs APMC Display',
            quote_timestamp: 'Today'
          },
          {
            mandi_name: 'Gwalior Laxmiganj APMC',
            distance_km: 15.0,
            gross_price_per_kg: 43.50,
            is_range: false,
            transport_cost_per_kg: 1.20,
            quote_source: 'APMC Daily Board',
            quote_timestamp: 'Today'
          }
        ],
        rainfall_forecast: {
          expected_rainfall_mm: 2.0,
          window_hours: 36,
          forecast_source: 'IMD Station',
          forecast_timestamp: new Date().toISOString()
        }
      };
      setFormData(s3Data);
      handleAnalyze(s3Data);
    } else if (scenarioKey === 'scenario4') {
      // Scenario 4: Missing Weather Data (Price-only mode)
      const s4Data = {
        ...INITIAL_FORM_DATA,
        crop_name: 'Gram / Chickpea (Desi Chana)',
        rainfall_forecast: null // Missing weather
      };
      setFormData(s4Data);
      handleAnalyze(s4Data);
    }
  };

  const handleOpenOverride = (option) => {
    setSelectedMandiForOverride(option);
    setOverrideModalOpen(true);
  };

  const handleRecordOverride = async (overridePayload) => {
    const res = await submitHumanOverride(overridePayload);
    setRecentOverrides(prev => [overridePayload, ...prev]);
    return res;
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Navigation */}
      <Navbar
        systemStatus={systemStatus}
        onSelectScenario={handleSelectScenario}
        isOfflineMode={isOfflineMode}
        onToggleOfflineMode={() => setIsOfflineMode(prev => !prev)}
      />

      <main style={{ flex: 1, padding: '2rem 0' }}>
        <div className="container">
          
          {/* Hero Banner */}
          <div className="card-hero" style={{ marginBottom: '2rem' }}>
            <div style={{ maxWidth: '800px', position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.15)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                <Sprout size={15} color="#e9c46a" />
                <span>Empowering Smallholder Farmers & FPO Aggregators</span>
              </div>
              <h1 style={{ fontSize: '2.1rem', fontWeight: 800, lineHeight: '1.2', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
                FasalWindow — The 36-Hour Harvest Decision Co-Pilot
              </h1>
              <p style={{ fontSize: '1rem', color: '#d8f3dc', lineHeight: '1.6', marginBottom: '1rem' }}>
                Compare mandi prices after transportation deductions, evaluate short-term rainfall spoilage risks, 
                and receive uncertainty-aware decision briefs in Hindi and English. Works offline with auditable human overrides.
              </p>
              <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.8rem', color: '#c2d6cc' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ShieldCheck size={16} color="#e9c46a" />
                  <span>Transparent Net Realization (Gross − Transport)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ShieldCheck size={16} color="#e9c46a" />
                  <span>Uncertainty-Aware Rainfall Safeguards</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ShieldCheck size={16} color="#e9c46a" />
                  <span>Zero Fake AI Guarantees</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cached / Offline Banner if active */}
          {analysis && analysis.is_cached_fallback && (
            <CachedIndicator
              cachedAt={analysis.cached_at || analysis.analysis_timestamp}
              cacheReason={analysis.cache_reason}
              onRefresh={() => handleAnalyze(formData)}
            />
          )}

          {/* Error Alert */}
          {error && (
            <div style={{
              background: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.25rem',
              color: '#991b1b',
              marginBottom: '1.5rem',
              fontSize: '0.9rem'
            }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Harvest Input Form */}
          <HarvestInputForm
            crops={crops}
            mandis={mandis}
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleAnalyze}
            isLoading={isLoading}
          />

          {/* Analysis Results Display */}
          {analysis && (
            <div id="results-section" className="animate-fade-in">
              
              {/* Warnings and Disclaimers */}
              <WarningBanner
                warnings={analysis.warnings}
                syntheticDisclaimer={analysis.synthetic_data_disclaimer}
                farmerDisclaimer={analysis.farmer_autonomy_disclaimer}
              />

              {/* Mandi Options Comparison */}
              <MandiComparison
                options={analysis.mandi_options}
                recommendedOption={analysis.recommended_option}
                onOpenOverride={handleOpenOverride}
              />

              {/* Rainfall Risk Assessment */}
              <RainfallRiskCard
                rainfall={analysis.rainfall_assessment}
              />

              {/* Bilingual Decision Brief (Hindi & English) */}
              <DecisionBrief
                brief={analysis.bilingual_brief}
                cropName={analysis.crop_name}
                village={analysis.village}
              />

            </div>
          )}

        </div>
      </main>

      {/* Human Override Modal */}
      <HumanOverrideModal
        isOpen={overrideModalOpen}
        onClose={() => setOverrideModalOpen(false)}
        selectedOption={selectedMandiForOverride}
        recommendedOption={analysis?.recommended_option}
        analysisId={analysis?.analysis_id}
        onSubmitOverride={handleRecordOverride}
        recentOverrides={recentOverrides}
      />

      {/* Footer */}
      <footer style={{
        background: 'var(--agri-dark)',
        color: '#94a3b8',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '1.5rem 0',
        fontSize: '0.825rem'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <strong style={{ color: '#ffffff' }}>FasalWindow Co-Pilot</strong> — IIIT Gwalior Hackathon Prototype
            <p style={{ marginTop: '0.25rem', color: '#64748b' }}>
              Built with React, Vite, Express, PostgreSQL, and FastAPI/Python.
            </p>
          </div>
          <div style={{ textAlign: 'right', color: '#64748b' }}>
            <span>Advisory Decision-Support Only • Farmer Retains 100% Autonomy</span>
            <p style={{ marginTop: '0.2rem' }}>All seed data and sample quotes are synthetic demonstration records.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
