import { Router } from 'express';
import { healthRoutes } from './health.route.js';
import { userRoutes } from './user.route.js';

const router: Router = Router();

router.use('/health', healthRoutes);
router.use('/user', userRoutes);

export { router as apiRoutes };
