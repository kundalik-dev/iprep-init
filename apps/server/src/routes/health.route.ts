import { Router } from 'express';
import { healthCheck } from '../controller/health.controller.js';

const router: Router = Router();

router.get('/', healthCheck);

export { router as healthRoutes };
