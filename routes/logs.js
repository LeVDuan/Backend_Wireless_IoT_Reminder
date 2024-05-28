import express from 'express';
import { getLogs, createLog, getAnalytics, getRecentActivity } from '../controllers/logs.js';
const LogsRouter = express.Router();

LogsRouter.get('/', getLogs);
LogsRouter.post('/', createLog);
LogsRouter.get('/analytics',getAnalytics);
LogsRouter.get('/recentActivity',getRecentActivity);

export default LogsRouter;