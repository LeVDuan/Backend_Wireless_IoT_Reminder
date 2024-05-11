import DeviceInfo from "../models/deviceInfo.js";
import mongoose from 'mongoose';


export const getDevices = async (req, res) => {
  try {
    const deviceList = await DeviceInfo.find();
    res.status(200).json(deviceList);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const createDevice = async (req, res) => {
  const { device_id, name, last_update, pin, status } = req.body;

  const newDevice = new DeviceInfo({ device_id, name, last_update, pin, status })

  try {
      await newDevice.save();
      res.status(201).json('success');
  } catch (error) {
      res.status(409).json({ message: error.message });
  }
};

export const updateDevice = async (req, res) => {
  const {id} = req.params;
  const { device_id, name, last_update, pin, status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send("not found");

  const updatedDevice = { _id: id, device_id, name, last_update, pin, status };
  const result = await DeviceInfo.findByIdAndUpdate(id, updatedDevice, { new : true })
  res.json("success");
}

export const deleteDevice = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send("not found");

  await DeviceInfo.findByIdAndDelete(id);
  res.json("success");
}

export const getActiveDevices = async (req, res) => {
  try {
    const deviceList = await DeviceInfo.find();
    const activeDevices = deviceList.filter(device => device.status === 1 || device.status === 0)
    res.status(200).json(activeDevices);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}