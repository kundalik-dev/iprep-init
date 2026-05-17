import { Router } from 'express';
import { bootstrapRoutes } from './bootstrap.route.js';
import { documentRoutes } from './document.route.js';
import { folderRoutes } from './folder.route.js';
import { healthRoutes } from './health.route.js';
import { onboardingRoutes } from './onboarding.route.js';
import { profileRoutes } from './profile.route.js';
import { userRoutes } from './user.route.js';
import settingsRoutes from './settings.route.js';
import { conversationRouter } from './conversation.routes.js';
import { analysisRoutes } from './analysis.route.js';
import { interviewRoutes } from './interview.route.js';

const router: Router = Router();

router.use('/', bootstrapRoutes);
router.use('/documents', documentRoutes);
router.use('/folders', folderRoutes);
router.use('/health', healthRoutes);
router.use('/onboarding', onboardingRoutes);
router.use('/user', profileRoutes);
router.use('/users', userRoutes);
router.use('/settings', settingsRoutes);
router.use('/conversations', conversationRouter);
router.use('/interviews', interviewRoutes);
router.use('/analysis', analysisRoutes);

export { router as apiRoutes };
