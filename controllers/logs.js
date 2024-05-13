import LogSchema from "../models/log.js";

export const getLogs = async (req, res) => {
  try {
    const logs = await LogSchema.find();
    res.status(200).json(logs);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const createLog = async (req, res) => {
  const { userName, deviceId, action, details } = req.body;

  const newLog = new LogSchema({ userName, deviceId, action, details })

  try {
      await newLog.save();
      res.status(201).json('success');
  } catch (error) {
      res.status(409).json({ message: error.message });
  }
};
