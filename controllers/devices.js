import DeviceSchema from "../models/device.js";
import mongoose from 'mongoose';

export const getAllDevices = async (req, res) => {
  try {
    const deviceList = await DeviceSchema.find();
    res.status(200).json({devices: deviceList, total: deviceList.length});
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getActiveDevices = async (req, res) => {
  try {
    const activeDevices = await DeviceSchema.find({isActive: true});
    res.status(200).json({devices: activeDevices, total: activeDevices.length});
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}

export const addDevice = async (req, res) => {
  const { deviceId, name } = req.body;
  const newDevice = new DeviceSchema({ deviceId, name })

  try {
      await newDevice.save();
      res.status(201).json('success');
  } catch (error) {
      res.status(409).json({ message: error.message });
  }
};

export const renameDevice = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send("not found");

  const renamedDevice = { _id: id, name };
  await DeviceSchema.findByIdAndUpdate(id, renamedDevice, { new : true })
  res.json("success");
}

export const deleteDevice = async (req, res) => {
  const { id } = req.params;

  console.log("Delete ", id);

  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send("not found");

  await DeviceSchema.findByIdAndDelete(id);
  res.json("success");
}