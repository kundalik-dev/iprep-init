import { Router } from 'express';
import { healthRoutes } from './health.route.js';
import { onboardingRoutes } from './onboarding.route.js';
import { profileRoutes } from './profile.route.js';
import { userRoutes } from './user.route.js';

const router: Router = Router();

router.use('/health', healthRoutes);
router.use('/onboarding', onboardingRoutes);
router.use('/user', profileRoutes);
router.use('/users', userRoutes);

export { router as apiRoutes };
