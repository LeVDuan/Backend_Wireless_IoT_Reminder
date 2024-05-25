import express from 'express';
import { getAllDevices, getActiveDevices, addDevice, getDevice, renameDevice, deleteDevice, updateCounter } from '../controllers/devices.js';
const deviceRouter = express.Router();

deviceRouter.get('/', getAllDevices);
deviceRouter.get('/activeDevices', getActiveDevices);
deviceRouter.get('/device', getDevice);

deviceRouter.post('/', addDevice);
deviceRouter.patch('/:id', renameDevice);
deviceRouter.patch('/UpdateControlCount/:id', updateCounter);
deviceRouter.delete('/:id', deleteDevice);

export default deviceRouter;