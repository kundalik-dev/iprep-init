import { Router } from 'express';
import { getBootstrap, getLocalStatus } from '../controller/bootstrap.controller.js';

const router: Router = Router();

router.get('/bootstrap', getBootstrap);
router.get('/local/status', getLocalStatus);

export { router as bootstrapRoutes };
