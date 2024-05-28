import LogSchema from "../models/log.js";

export const getLogs = async (req, res) => {
  try {
    const logs = await LogSchema.find();
    res.status(200).json({ logs: logs, total: logs.length });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getRecentActivity = async (req, res) => {
  try {
    const deviceId = req.query.deviceId;
    let logs;
    if(deviceId != undefined) {
      logs = await LogSchema.find({ deviceId: deviceId })
        .sort({ timestamp: -1 })
        .limit(3);
    } else{
      logs = await LogSchema.find()
        .sort({ timestamp: -1 })
        .limit(3);
    }
      res.status(200).json(logs);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const createLog = async (req, res) => {
  const { userName, deviceId, deviceName, action, details, result } = req.body;

  const newLog = new LogSchema({
    userName,
    deviceId,
    deviceName,
    action,
    details,
    result,
  });

  try {
    await newLog.save();
    res.status(201).json("success");
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const VBRCount = await LogSchema.countDocuments({
      action: "control",
      result: "success",
      "details.type": "vibrate",
    });
    const LGTCount = await LogSchema.countDocuments({
      action: "control",
      result: "success",
      "details.type": "light",
    });
    const VLGCount = await LogSchema.countDocuments({
      action: "control",
      result: "success",
      "details.type": "vibrate and light",
    });

    const dayAgo = req.query.dayAgo;

    // Query the number of documents with action='control' in the previous 7 days
    const queryDaysAgo = new Date();
    queryDaysAgo.setDate(queryDaysAgo.getDate() - dayAgo);

    const query = {
      action: "control",
      timestamp: { $gte: queryDaysAgo },
    };
    const results = await LogSchema.aggregate([
      {
        $match: query,
      },
      {
        $group: {
          _id: {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
            day: { $dayOfMonth: "$timestamp" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
      },
    ]);

    res.status(200).json({
      VBR: VBRCount,
      LGT: LGTCount,
      VLG: VLGCount,
      control: results,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
