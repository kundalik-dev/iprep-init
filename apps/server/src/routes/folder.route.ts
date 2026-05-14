import { Router } from 'express';
import {
  createFolder,
  deleteFolder,
  listFolders,
  updateFolder,
} from '../controller/document.controller.js';

const router: Router = Router();

router.get('/', listFolders);
router.post('/', createFolder);
router.patch('/:folderId', updateFolder);
router.delete('/:folderId', deleteFolder);

export { router as folderRoutes };
