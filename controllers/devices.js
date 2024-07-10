import DeviceSchema from "../models/device.js";
import LogSchema from "../models/log.js";
import mongoose from "mongoose";

const createLog = async (logInfo) => {
  const { userName, deviceId, deviceName, action, details, result } = logInfo;
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
    console.log("create Log: success");
    return 1;
  } catch (error) {
    console.log(error);
    return 0;
  }
};
export const getAllDevices = async (req, res) => {
  try {
    const deviceList = await DeviceSchema.find().sort({ deviceId: 1 });

    res.status(200).json({ devices: deviceList, total: deviceList.length });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getActiveDevices = async (req, res) => {
  try {
    const activeDevices = await DeviceSchema.find({ isActive: true }).sort({
      deviceId: 1,
    });

    res
      .status(200)
      .json({ devices: activeDevices, total: activeDevices.length });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getDevice = async (req, res) => {
  try {
    const { id } = req.params;
    const device = await DeviceSchema.findById(id);
    console.log(device);
    res.status(200).json({ device });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getCtrlCommand = async (req, res) => {
  const { type, deviceId, controlTime, periodTime, pauseTime } = req.body;
  if (type === "Broadcast") {
    return res.status(200).json({ command: "BRD\n" });
  } else if (type === "Request") {
    if (deviceId === -1) {
      return res.status(200).json({ command: "REQ 100\n" });
    } else {
      return res.status(200).json({ command: `REQ ${deviceId}\n` });
    }
  } else {
    const command =
      type +
      " " +
      deviceId +
      " " +
      controlTime +
      " " +
      periodTime +
      " " +
      pauseTime +
      "\n";
    console.log("command: ", command);
    return res.status(200).json({ command });
  }
};
export const controlDevice = async (req, res) => {
  const { id } = req.params;
  console.log("control ", req.body);
  const {
    userName,
    deviceName,
    type,
    deviceId,
    controlTime,
    periodTime,
    pauseTime,
    result,
  } = req.body;
  if (!mongoose.Types.ObjectId.isValid(id))
    return console.log("Device not found!");
  try {
    // update control count
    switch (type) {
      case "VBR":
        await DeviceSchema.findByIdAndUpdate(id, {
          $inc: {
            VBRCount: 1, // Increment VBRCount by 1
          },
        });
        break;
      case "LGT":
        await DeviceSchema.findByIdAndUpdate(id, {
          $inc: {
            LGTCount: 1, // Increment LGTCount by 1
          },
        });
        break;
      case "VLG":
        await DeviceSchema.findByIdAndUpdate(id, {
          $inc: {
            VLGCount: 1, // Increment VLGCount by 1
          },
        });
        break;
    }
    const log = {
      userName,
      deviceId,
      deviceName,
      action: "control",
      details: {
        objId: id,
        type,
        controlTime,
        periodTime,
        pauseTime,
      },
      result,
    };
    await createLog(log);
    res.status(200).json({ message: "Success!" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
export const addDevice = async (req, res) => {
  const { deviceId, name, userName } = req.body;

  console.log("add: ", req.body);
  const newDevice = new DeviceSchema({ deviceId, name });

  try {
    const objId = (await newDevice.save())._id;
    const log = {
      userName,
      deviceId,
      deviceName: name,
      action: "add",
      details: { objId },
      result: "success",
    };
    await createLog(log);
    res.status(201).json({ message: "Success!" });
  } catch (error) {
    const log = {
      userName,
      deviceId,
      deviceName: name,
      action: "add",
      details: { objId: "" },
      result: "error",
    };
    await createLog(log);
    res.status(400).json({ message: error.message });
  }
};

export const renameDevice = async (req, res) => {
  const { id } = req.params;
  const { deviceId, oldName, newName, userName } = req.body;
  console.log("rename: ", id, "info: ", req.body);

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send({ message: "Device not found!" });

  const renamedDevice = { _id: id, name: newName };
  try {
    await DeviceSchema.findByIdAndUpdate(id, renamedDevice, { new: true });
    const log = {
      userName,
      deviceId,
      deviceName: newName,
      action: "edit",
      details: { objId: id, oldName, newName },
      result: "success",
    };
    await createLog(log);
    res.status(200).json({ message: "Success!" });
  } catch (error) {
    const log = {
      userName,
      deviceId,
      deviceName: oldName,
      action: "edit",
      details: { objId: id, oldName, newName },
      result: "error",
    };
    await createLog(log);
    res.status(400).json({ message: error.message });
  }
};

export const updateStatus = async (req, res) => {
  const lastUpdated = new Date();
  console.log("update: ", req.body);
  const { update } = req.body;
  const isUpdateMany = JSON.parse(req.query.many);
  console.log("Many?: ", isUpdateMany);

  const pairs = update.match(/\d+:\d+/g);
  
  
  if (isUpdateMany === true) {
    if (
      update === "REQ:-1" ||
      update === "REQ:" ||
      update === "REQ:\r" ||
      update === "REQ:-1\r"
    ) {
      return res.status(200).json({ message: "Transmitter update failed!" });
    } else if(update === "REQ:00" || update === "REQ:00\r") {
      try {
        // update inactive
        await DeviceSchema.updateMany(
          { $set: { isActive: false, lastUpdated } }
        );
  
        return res.status(200).json({ message: "Has no active device!" });
      } catch (error) {
        res.status(500).json({ result: "server error" });
      }
    }
    const updateData = pairs.map((pair) => {
      const [deviceId, batteryStatus] = pair.split(":");
      return {
        deviceId: parseInt(deviceId),
        batteryStatus: parseInt(batteryStatus),
      };
    });
    try {
      const deviceIdsToUpdate = updateData.map((device) => device.deviceId); // list of active deviceId

      // update status and batteryStatus
      for (const device of updateData) {
        const { deviceId, batteryStatus } = device;
        await DeviceSchema.updateMany(
          { deviceId },
          { $set: { batteryStatus, isActive: true, lastUpdated } }
        );
        console.log("update: ", deviceId, batteryStatus);
      }
      // update inactive
      await DeviceSchema.updateMany(
        { deviceId: { $nin: deviceIdsToUpdate } },
        { $set: { isActive: false, lastUpdated } }
      );

      res.status(200).json({ message: "Update successful!" });
    } catch (error) {
      res.status(500).json({ result: "server error" });
    }
  } else {
    if (
      update === "REQ:-1" ||
      update === "REQ:" ||
      update === "REQ:\r" ||
      update === "REQ:-1\r" ||
      update === "REQ:00" || update === "REQ:00\r"
    ) {
      const id = req.body.id
      console.log("update id:", id)
      await DeviceSchema.findByIdAndUpdate(
        id,
        { $set: {isActive: false, lastUpdated } }
      );
      return res.status(200).json({ message: "This device is inactive!" });
    } else {
      const updateData = pairs.map((pair) => {
        const [deviceId, batteryStatus] = pair.split(":");
        return {
          deviceId: parseInt(deviceId),
          batteryStatus: parseInt(batteryStatus),
        };
      });
      const id = req.body.id
      const { batteryStatus } = updateData[0];
      console.log("isActive: ", id, "status: ", batteryStatus);
  
      await DeviceSchema.findByIdAndUpdate(
        id,
        { $set: { batteryStatus, isActive: true, lastUpdated } }
      );
      res.status(200).json({ message: "Update successful" });
    }
   
  }
};

export const deleteDevice = async (req, res) => {
  const { id } = req.params;
  const { userName } = req.body;
  console.log("Delete: ", id, "by: ", userName);

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send({ message: "Invalid!" });
  const delDevice = await DeviceSchema.findById(id);
  try {
    const deletedDevice = await DeviceSchema.findByIdAndDelete(id);
    const log = {
      userName,
      deviceId: deletedDevice.deviceId,
      deviceName: deletedDevice.name,
      action: "delete",
      details: { objId: id },
      result: "success",
    };
    await createLog(log);
    res.status(200).json({ message: "Success!" });
  } catch (error) {
    const log = {
      userName,
      deviceId: delDevice.deviceId,
      deviceName: delDevice.name,
      action: "delete",
      details: { objId: id },
      result: "error",
    };
    await createLog(log);
    res.status(400).json({ message: error.message });
  }
};
