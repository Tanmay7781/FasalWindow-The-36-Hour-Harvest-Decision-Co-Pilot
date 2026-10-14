const db = require('../config/db');
const fastapiClient = require('../services/fastapiClient');

async function analyzeHarvest(req, res, next) {
  try {
    const { crop_name, mandi_quotes, village, decision_window_hours, quantity_kg, rainfall_forecast, actor_id } = req.body;

    // Basic request validation
    if (!crop_name || typeof crop_name !== 'string' || crop_name.trim().length === 0) {
      return res.status(400).json({
        error: true,
        code: 'VALIDATION_ERROR',
        message: 'Field "crop_name" is required and must be a non-empty string.'
      });
    }

    if (!Array.isArray(mandi_quotes) || mandi_quotes.length === 0) {
      return res.status(400).json({
        error: true,
        code: 'VALIDATION_ERROR',
        message: 'Field "mandi_quotes" is required and must contain at least one mandi quotation.'
      });
    }

    // Call Python FastAPI analytical engine
    const analysisResult = await fastapiClient.analyze({
      crop_name: crop_name.trim(),
      village: village || 'Gwalior Rural Cluster',
      decision_window_hours: parseInt(decision_window_hours || 36, 10),
      quantity_kg: quantity_kg ? parseFloat(quantity_kg) : null,
      mandi_quotes,
      rainfall_forecast: rainfall_forecast || null,
      actor_id: actor_id || 'Farmer Self'
    });

    let dbPersisted = false;
    let persistenceNote = null;

    // Persist in PostgreSQL with parameterized queries
    if (db.isDbConnected()) {
      try {
        const insertAnalysisQuery = `
          INSERT INTO analysis_records (
            id, crop_name, village, decision_window_hours, quantity_kg,
            recommended_mandi_name, recommended_net_price, rainfall_status,
            tradeoff_summary, request_payload, response_payload, actor_id
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `;
        const values = [
          analysisResult.analysis_id,
          analysisResult.crop_name,
          analysisResult.village,
          analysisResult.decision_window_hours,
          analysisResult.quantity_kg,
          analysisResult.recommended_option?.mandi_name || 'N/A',
          analysisResult.recommended_option?.net_representative || 0,
          analysisResult.rainfall_assessment?.status || 'UNKNOWN',
          analysisResult.tradeoff_summary,
          JSON.stringify(req.body),
          JSON.stringify(analysisResult),
          actor_id || 'Farmer Self'
        ];
        await db.query(insertAnalysisQuery, values);

        // Insert recommendations
        if (analysisResult.mandi_options && analysisResult.mandi_options.length > 0) {
          for (let i = 0; i < analysisResult.mandi_options.length; i++) {
            const opt = analysisResult.mandi_options[i];
            const insertRecQuery = `
              INSERT INTO recommendations (
                analysis_id, mandi_name, rank_order, distance_km,
                gross_price_display, transport_cost_display,
                net_realization_display, net_representative
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `;
            await db.query(insertRecQuery, [
              analysisResult.analysis_id,
              opt.mandi_name,
              i + 1,
              opt.distance_km,
              opt.gross_price_display,
              opt.transport_cost_display,
              opt.net_realization_display,
              opt.net_representative
            ]);
          }
        }
        dbPersisted = true;
      } catch (dbErr) {
        console.warn(`[AnalysisController] PostgreSQL persistence warning: ${dbErr.message}`);
        persistenceNote = `Database write note: ${dbErr.message}`;
      }
    } else {
      // Save in resilient in-memory store
      db.inMemoryStore.analyses.set(analysisResult.analysis_id, {
        ...analysisResult,
        request_payload: req.body,
        persisted_at: new Date().toISOString()
      });
      persistenceNote = 'Saved to resilient in-memory audit store (PostgreSQL connection pending).';
    }

    return res.status(200).json({
      success: true,
      analysis: analysisResult,
      meta: {
        persisted_to_db: dbPersisted,
        persistence_note: persistenceNote,
        engine: 'FastAPI / Python analytical service'
      }
    });

  } catch (err) {
    next(err);
  }
}

async function getAnalysisById(req, res, next) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: true, message: 'Analysis ID is required.' });
    }

    if (db.isDbConnected()) {
      const result = await db.query('SELECT * FROM analysis_records WHERE id = $1', [id]);
      if (result.rows.length > 0) {
        return res.json({ success: true, analysis: result.rows[0], source: 'postgresql' });
      }
    }

    // Check in-memory store
    if (db.inMemoryStore.analyses.has(id)) {
      return res.json({ success: true, analysis: db.inMemoryStore.analyses.get(id), source: 'in_memory_store' });
    }

    return res.status(404).json({ error: true, message: `Analysis with ID ${id} not found.` });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  analyzeHarvest,
  getAnalysisById,
};
