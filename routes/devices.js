import express from 'express';
import { getAllDevices, getActiveDevices, addDevice, renameDevice, deleteDevice } from '../controllers/devices.js';
const deviceRouter = express.Router();

deviceRouter.get('/', getAllDevices);
deviceRouter.get('/activeDevices', getActiveDevices);
deviceRouter.post('/', addDevice);
deviceRouter.patch('/:id', renameDevice);
deviceRouter.delete('/:id', deleteDevice);

export default deviceRouter;