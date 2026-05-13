import { Router } from 'express';
import {
  completeOnboarding,
  getOnboarding,
  saveOnboardingGoal,
  saveOnboardingProfile,
  saveOnboardingProvider,
  testOnboardingProviderConnection,
} from '../controller/onboarding.controller.js';

const router: Router = Router();

router.get('/', getOnboarding);
router.post('/profile', saveOnboardingProfile);
router.post('/goal', saveOnboardingGoal);
router.post('/provider/test', testOnboardingProviderConnection);
router.post('/provider', saveOnboardingProvider);
router.post('/complete', completeOnboarding);

export { router as onboardingRoutes };

