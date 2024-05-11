import express from 'express';
import { getDevices, createDevice, updateDevice, deleteDevice, getActiveDevices } from '../controllers/devices.js';
const router = express.Router();

router.get('/', getDevices);
router.get('/activeDevices', getActiveDevices);
router.post('/', createDevice);
router.patch('/:id', updateDevice);
router.delete('/:id', deleteDevice);

export default router;