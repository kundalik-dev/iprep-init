import { Router } from 'express';
import multer from 'multer';
import {
  convertDocument,
  createDocument,
  deleteDocument,
  getDocument,
  listDocuments,
  updateDocument,
  uploadDocument,
} from '../controller/document.controller.js';

const router: Router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

router.get('/', listDocuments);
router.post('/', createDocument);
router.post('/upload', upload.single('file'), uploadDocument);
router.get('/:documentId', getDocument);
router.patch('/:documentId', updateDocument);
router.delete('/:documentId', deleteDocument);
router.post('/:documentId/convert', convertDocument);

export { router as documentRoutes };
