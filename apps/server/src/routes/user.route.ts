import { Router } from 'express';
import {
  createUser,
  deleteUser,
  findAllUsers,
  findUserById,
  updateUser,
} from '../controller/user.controller.js';

const router: Router = Router();

router.get('/', findAllUsers);
router.post('/', createUser);
router.get('/:id', findUserById);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

export { router as userRoutes };
