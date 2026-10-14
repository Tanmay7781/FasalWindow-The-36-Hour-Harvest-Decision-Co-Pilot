const db = require('../config/db');

async function createOverride(req, res, next) {
  try {
    const { analysis_id, original_recommended_mandi, chosen_mandi, override_reason, actor_id } = req.body;

    if (!analysis_id) {
      return res.status(400).json({ error: true, message: 'Missing required field "analysis_id".' });
    }
    if (!chosen_mandi) {
      return res.status(400).json({ error: true, message: 'Missing required field "chosen_mandi".' });
    }
    if (!override_reason || override_reason.trim().length === 0) {
      return res.status(400).json({ error: true, message: 'A valid reason for the human override is mandatory for audit compliance.' });
    }

    const timestamp = new Date().toISOString();
    const actor = actor_id || 'Farmer / FPO Extension Worker';
    const original = original_recommended_mandi || 'Unspecified';

    let dbPersisted = false;

    if (db.isDbConnected()) {
      try {
        const query = `
          INSERT INTO human_overrides (
            analysis_id, original_recommended_mandi, chosen_mandi, override_reason, actor_id, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id, analysis_id, original_recommended_mandi, chosen_mandi, override_reason, actor_id, created_at
        `;
        const result = await db.query(query, [
          analysis_id, original, chosen_mandi, override_reason.trim(), actor, timestamp
        ]);
        dbPersisted = true;
        return res.status(201).json({
          success: true,
          override: result.rows[0],
          persisted_to_db: true,
          message: 'Human override successfully logged in PostgreSQL audit trail.'
        });
      } catch (dbErr) {
        console.warn(`[OverrideController] PostgreSQL write warning: ${dbErr.message}`);
      }
    }

    // In-memory fallback
    const overrideRecord = {
      id: db.inMemoryStore.overrides.length + 1,
      analysis_id,
      original_recommended_mandi: original,
      chosen_mandi,
      override_reason: override_reason.trim(),
      actor_id: actor,
      created_at: timestamp
    };
    db.inMemoryStore.overrides.push(overrideRecord);

    return res.status(201).json({
      success: true,
      override: overrideRecord,
      persisted_to_db: false,
      message: 'Human override logged in resilient in-memory audit store.'
    });

  } catch (err) {
    next(err);
  }
}

async function getOverrides(req, res, next) {
  try {
    if (db.isDbConnected()) {
      const result = await db.query('SELECT * FROM human_overrides ORDER BY created_at DESC LIMIT 50');
      return res.json({ success: true, count: result.rows.length, overrides: result.rows, source: 'postgresql' });
    }
    return res.json({ success: true, count: db.inMemoryStore.overrides.length, overrides: db.inMemoryStore.overrides, source: 'in_memory' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createOverride,
  getOverrides,
};
