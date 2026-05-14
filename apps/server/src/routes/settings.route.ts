import { Router } from 'express';
import {
  getPreferences,
  updatePreferences,
  getProviders,
  saveApiKey,
  deleteProviderKey,
  revealApiKey,
} from '../controller/settings.controller.js';
import { getCliStatus, testProvider } from '../controller/provider-check.controller.js';

const router: Router = Router();

// ── Preferences ───────────────────────────────────────────────────────────────
router.get('/preferences', getPreferences);
router.put('/preferences', updatePreferences);

// ── Provider credentials list ─────────────────────────────────────────────────
router.get('/providers', getProviders);

// ── CLI installation status ───────────────────────────────────────────────────
// GET /api/v1/settings/providers/cli-status
router.get('/providers/cli-status', getCliStatus);

// ── Test a stored provider key ────────────────────────────────────────────────
// POST /api/v1/settings/providers/:id/test
router.post('/providers/:id/test', testProvider);

// ── API Key management ────────────────────────────────────────────────────────
router.post('/api-keys', saveApiKey);
router.delete('/api-keys/:id', deleteProviderKey);
router.get('/api-keys/:id/reveal', revealApiKey);

export default router;
