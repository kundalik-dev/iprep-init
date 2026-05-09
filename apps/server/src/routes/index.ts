import { Router } from 'express';
import { healthRoutes } from './health.route.js';

const router: Router = Router();

router.use('/health', healthRoutes);

export { router as apiRoutes };
