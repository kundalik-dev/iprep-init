import { Router } from 'express';
import {
  appendTranscript,
  cancelInterview,
  createInterview,
  deleteInterview,
  downloadRecording,
  downloadTranscript,
  endInterview,
  getInterview,
  getInterviewAnalysis,
  getInterviewCommunication,
  getRecording,
  getTranscript,
  listInterviews,
  startInterview,
  triggerAnalysis,
  updateInterview,
} from '../controller/interview.controller.js';

export const interviewRoutes: Router = Router();

interviewRoutes.get('/', listInterviews);
interviewRoutes.post('/', createInterview);
interviewRoutes.get('/:interviewId', getInterview);
interviewRoutes.patch('/:interviewId', updateInterview);
interviewRoutes.post('/:interviewId/start', startInterview);
interviewRoutes.post('/:interviewId/end', endInterview);
interviewRoutes.post('/:interviewId/cancel', cancelInterview);
interviewRoutes.delete('/:interviewId', deleteInterview);
interviewRoutes.get('/:interviewId/transcript', getTranscript);
interviewRoutes.post('/:interviewId/transcript', appendTranscript);
interviewRoutes.get('/:interviewId/recording', getRecording);
interviewRoutes.get('/:interviewId/recording/download', downloadRecording);
interviewRoutes.get('/:interviewId/transcript/download', downloadTranscript);
interviewRoutes.post('/:interviewId/analysis', triggerAnalysis);
interviewRoutes.get('/:interviewId/analysis', getInterviewAnalysis);
interviewRoutes.get('/:interviewId/communication', getInterviewCommunication);
