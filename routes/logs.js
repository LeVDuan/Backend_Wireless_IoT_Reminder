import express from 'express';
import { getLogs, createLog } from '../controllers/logs.js';
const LogsRouter = express.Router();

LogsRouter.get('/', getLogs);
LogsRouter.post('/', createLog);

export default LogsRouter;