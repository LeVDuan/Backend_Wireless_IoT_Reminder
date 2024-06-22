import LogSchema from "../models/log.js";
import DeviceSchema from "../models/device.js";
import { VIBRATE, LIGHT, VIBRATE_LIGHT } from "../constants/index.js";

export const getLogs = async (req, res) => {
  const { dates = [], action = "" } = req.query ?? "";
  // console.log("date:", dates, "action", action);
  try {
    const logs = await LogSchema.find().sort({ timestamp: -1 });
    const filteredData = logs.filter((log) => {
      const isActionMatched = action === "" || log.action === action;
      const isDateInRange = !dates ||
        dates.length === 0 ||
        (log.timestamp >= new Date(dates[0]) &&
          log.timestamp <= new Date(dates[1]));
      return isActionMatched && isDateInRange;
    });
    // console.log(filteredData);
    res.status(200).json({ logs: filteredData, total: filteredData.length });
  } catch (error) {
    res.status(400).json({ message: error.message, result: "Failed!" });
  }
};

export const getRecentActivity = async (req, res) => {
  try {
    const deviceId = req.query.deviceId;
    let logs;
    if (deviceId != undefined) {
      logs = await LogSchema.find({ deviceId: deviceId })
        .sort({ timestamp: -1 })
        .limit(3);
    } else {
      logs = await LogSchema.find().sort({ timestamp: -1 }).limit(3);
    }
    res.status(200).json(logs);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const createLog = async (req, res) => {
  const { userName, deviceId, deviceName, action, details, result } =
    req.body.log;

  const newLog = new LogSchema({
    userName,
    deviceId,
    deviceName,
    action,
    details,
    result,
  });
  console.log("log: ", req.body);
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
      "details.type": VIBRATE,
    });
    const LGTCount = await LogSchema.countDocuments({
      action: "control",
      result: "success",
      "details.type": LIGHT,
    });
    const VLGCount = await LogSchema.countDocuments({
      action: "control",
      result: "success",
      "details.type": VIBRATE_LIGHT,
    });
    const deviceCount = await DeviceSchema.countDocuments();
    const deviceActiveCount = await DeviceSchema.countDocuments({
      isActive: true,
    });

    // Query the number of documents with action='control' in the previous 7 days
    const queryDaysAgo = new Date();
    queryDaysAgo.setDate(queryDaysAgo.getDate() - 7);

    const query = {
      action: "control",
      result: "success",
      timestamp: { $gte: queryDaysAgo },
    };

    const queryVBR = {
      action: "control",
      result: "success",
      "details.type": VIBRATE,
      timestamp: { $gte: queryDaysAgo },
    };

    const queryLGT = {
      action: "control",
      result: "success",
      "details.type": LIGHT,
      timestamp: { $gte: queryDaysAgo },
    };

    const queryVLG = {
      action: "control",
      result: "success",
      "details.type": VIBRATE_LIGHT,
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
    const resultsVBR = await LogSchema.aggregate([
      {
        $match: queryVBR,
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
    const resultsLGT = await LogSchema.aggregate([
      {
        $match: queryLGT,
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

    const resultsVLG = await LogSchema.aggregate([
      {
        $match: queryVLG,
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
      deviceCount: deviceCount,
      deviceActiveCount: deviceActiveCount,
      controlLastWeek: results,
      VBRLastWeek: resultsVBR,
      LGTLastWeek: resultsLGT,
      VLGLastWeek: resultsVLG,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
