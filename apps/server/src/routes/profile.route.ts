import { Router } from 'express';
import { getLocalUserProfile, updateLocalUserProfile } from '../controller/profile.controller.js';

const router: Router = Router();

router.get('/', getLocalUserProfile);
router.patch('/', updateLocalUserProfile);

export { router as profileRoutes };

