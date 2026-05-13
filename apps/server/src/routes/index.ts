import { Router } from 'express';
import { bootstrapRoutes } from './bootstrap.route.js';
import { documentRoutes } from './document.route.js';
import { healthRoutes } from './health.route.js';
import { onboardingRoutes } from './onboarding.route.js';
import { profileRoutes } from './profile.route.js';
import { userRoutes } from './user.route.js';

const router: Router = Router();

router.use('/', bootstrapRoutes);
router.use('/documents', documentRoutes);
router.use('/health', healthRoutes);
router.use('/onboarding', onboardingRoutes);
router.use('/user', profileRoutes);
router.use('/users', userRoutes);

export { router as apiRoutes };
