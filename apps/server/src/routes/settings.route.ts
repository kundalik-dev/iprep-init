import { Router } from 'express';
import {
  getPreferences,
  updatePreferences,
  getProviders,
  saveApiKey,
  deleteProviderKey,
  revealApiKey,
} from '../controller/settings.controller.js';

const router: Router = Router();

// ── Preferences ───────────────────────────────────────────────────────────────
// GET  /api/v1/settings/preferences
// PUT  /api/v1/settings/preferences
router.get('/preferences', getPreferences);
router.put('/preferences', updatePreferences);

// ── Provider credentials list ─────────────────────────────────────────────────
// GET  /api/v1/settings/providers
router.get('/providers', getProviders);

// ── API Key management ────────────────────────────────────────────────────────
// POST   /api/v1/settings/api-keys          — add or replace a key (encrypted)
// DELETE /api/v1/settings/api-keys/:id      — remove a key
// GET    /api/v1/settings/api-keys/:id/reveal — decrypt and return (use with care)
router.post('/api-keys', saveApiKey);
router.delete('/api-keys/:id', deleteProviderKey);
router.get('/api-keys/:id/reveal', revealApiKey);

export default router;
