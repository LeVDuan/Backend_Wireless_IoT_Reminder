import express from 'express';
import { getLogs, createLog, getAnalytics } from '../controllers/logs.js';
const LogsRouter = express.Router();

LogsRouter.get('/', getLogs);
LogsRouter.post('/', createLog);
LogsRouter.get('/analytics',getAnalytics);

export default LogsRouter;