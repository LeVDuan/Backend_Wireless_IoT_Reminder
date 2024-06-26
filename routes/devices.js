import express from 'express';
import { getAllDevices, getActiveDevices, addDevice, getDevice, renameDevice, deleteDevice, updateStatus, getCtrlCommand, controlDevice } from '../controllers/devices.js';
const deviceRouter = express.Router();

deviceRouter.get('/', getAllDevices);
deviceRouter.get('/activeDevices', getActiveDevices);
deviceRouter.get('/:id', getDevice);

deviceRouter.post('/control', getCtrlCommand);
deviceRouter.post('/', addDevice);
deviceRouter.patch('/:id', renameDevice);
deviceRouter.patch('/control/:id', controlDevice);
deviceRouter.patch('/updateStatus/:id', updateStatus);
deviceRouter.delete('/:id', deleteDevice);

export default deviceRouter;