import express from 'express';
import { getLogs, getAnalytics, getRecentActivity, deleteLog } from '../controllers/logs.js';
const LogsRouter = express.Router();

LogsRouter.get('/', getLogs);
LogsRouter.get('/analytics',getAnalytics);
LogsRouter.get('/recentActivity',getRecentActivity);
LogsRouter.delete('/:id', deleteLog);

export default LogsRouter;