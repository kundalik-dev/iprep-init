import { Router } from 'express';
import { SettingsController } from '../controller/settings.controller.js';

const router = Router();

// Preferences routes
router.get('/preferences', SettingsController.getPreferences);
router.put('/preferences', SettingsController.updatePreferences);

// Providers routes
router.get('/providers', SettingsController.getProviders);
router.post('/providers', SettingsController.upsertProvider);
router.delete('/providers/:id', SettingsController.deleteProvider);

export default router;
