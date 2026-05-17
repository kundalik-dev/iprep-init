import { Router } from 'express';
import { downloadAnalysis, getAnalysisById } from '../controller/interview.controller.js';

export const analysisRoutes: Router = Router();

analysisRoutes.get('/:analysisId', getAnalysisById);
analysisRoutes.get('/:analysisId/download', downloadAnalysis);
