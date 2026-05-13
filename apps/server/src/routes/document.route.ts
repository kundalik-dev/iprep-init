import { Router } from 'express';
import multer from 'multer';
import { listDocuments, uploadDocument } from '../controller/document.controller.js';

const router: Router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

router.get('/', listDocuments);
router.post('/upload', upload.single('file'), uploadDocument);

export { router as documentRoutes };
