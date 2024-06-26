import DeviceSchema from "../models/device.js";
import LogSchema from "../models/log.js";
import mongoose from "mongoose";
// 
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
  
}
export const getAllDevices = async (req, res) => {
  try {
    const deviceList = await DeviceSchema.find().sort({ deviceId: 1 });

    res.status(200).json({ devices: deviceList, total: deviceList.length });
  } catch (error) {
    res.status(400).json({ message: error.message});
  }
};

export const getActiveDevices = async (req, res) => {
  try {
    const activeDevices = await DeviceSchema.find({ isActive: true }).sort({ deviceId: 1 });

    res
      .status(200)
      .json({ devices: activeDevices, total: activeDevices.length });
  } catch (error) {
    res.status(400).json({ message: error.message});
  }
};

export const getDevice = async (req, res) => {
  try {
    const {id} = req.params;
    const device = await DeviceSchema.findById(id);
    console.log(device)
    res
      .status(200)
      .json({device});
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getCtrlCommand = async (req, res) => {
    const {type, deviceId, controlTime, periodTime, pauseTime } = req.body;
    if(type === 'Broadcast') {
      return res.status(200).json({command: "BRD\n"});
    } else if(type === 'Request') {
      if(deviceId === -1) {

        return res.status(200).json({command: "REQ\n"});
      } else {
        return res.status(200).json({command: `REQ ${deviceId}\n`})
      }
    } else {
      const command = type + ' ' + deviceId + ' ' + controlTime + ' ' + periodTime + ' ' + pauseTime + '\n';
      console.log("command: ",command)
      return res.status(200).json({command})
    }  
};
export const controlDevice = async (req, res) => {
  const { id } = req.params;
  const {userName, deviceName, type, deviceId, controlTime, periodTime, pauseTime, result } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id))
    return console.log("Device not found!")
  try {
    // update control count
    switch (type) {
      case "VBR":
        await DeviceSchema.findByIdAndUpdate(
          id,
          {
              $inc: {
                  VBRCount: 1, // Increment VBRCount by 1
              },
          }
      );
        break;
      case "LGT":
        await DeviceSchema.findByIdAndUpdate(
          id,
          {
              $inc: {
                  LGTCount: 1, // Increment LGTCount by 1
              },
          }
      );
        break;
      case "VLG":
        await DeviceSchema.findByIdAndUpdate(
          id,
          {
              $inc: {
                  VLGCount: 1, // Increment VLGCount by 1
              },
          }
      );
        break;
    }
    const log = { userName, deviceId, deviceName, action: "control", details : {
      objId: id,
      type,
      controlTime,
      periodTime,
      pauseTime},
      result };
    await createLog(log);
    res.status(200).json({message: "Success!"});
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
export const addDevice = async (req, res) => {
  const { deviceId, name, userName } = req.body;
  
  console.log("add: ",req.body)
  const newDevice = new DeviceSchema({ deviceId, name });

  try {
    const objId = (await newDevice.save())._id;
    const log = {userName, deviceId, deviceName: name, action: 'add', details: {objId}, result: 'success'};
    await createLog(log);
    res.status(201).json({message: "Success!"});
  } catch (error) {
    const log = {userName, deviceId, deviceName: name, action: 'add', details: {objId: ""}, result: 'error'};
    await createLog(log);
    res.status(400).json({ message: error.message});
  }

};

export const renameDevice = async (req, res) => {
  const { id } = req.params;
  const { deviceId, oldName, newName, userName} = req.body;
  console.log("rename: ", id, "info: ", req.body)

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send({message: "Device not found!"});

  const renamedDevice = { _id: id, name: newName };
  try {
    await DeviceSchema.findByIdAndUpdate(id, renamedDevice, { new: true });
    const log = {userName, deviceId, deviceName: newName, action: 'edit', details: { objId: id, oldName, newName }, result: 'success'};
    await createLog(log);
    res.status(200).json({message: "Success!"});
  } catch (error) {
    const log = {userName, deviceId, deviceName: oldName, action: 'edit', details: {objId: id, oldName, newName}, result: 'error'};
    await createLog(log);
    res.status(400).json({ message: error.message });
  }
};

export const updateStatus = async (req, res) => {
  const lastUpdated = new Date()
  // console.log("update: ", req.body)
  const { id } = req.params;
  if(id === '-1') {
      try {
        const updates = req.body.update;  // device active id and batteryStatus
        const deviceIdsToUpdate = updates.map(device => device.deviceId); // list of active deviceId

        // update status and batteryStatus
        for (const device of updates) {
            const { deviceId, batteryStatus } = device;
            await DeviceSchema.updateMany(
                { deviceId },
                { $set: { batteryStatus, isActive: true, lastUpdated } }
            );
        }
        // update inactive
        await DeviceSchema.updateMany(
            { deviceId: { $nin: deviceIdsToUpdate } },
            { $set: { isActive: false, lastUpdated } }
        );

        res.status(200).json({result: "Success!"});
    } catch (error) {
        res.status(500).json({result: "server error"} );
    }

  } else {

    const { isActive, batteryStatus } = req.body;
  console.log("isActive: ", isActive, "status: ", batteryStatus)

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).send({result: "not found"});
    const updatedDevice = { _id: id, isActive, batteryStatus, lastUpdated };
    await DeviceSchema.findByIdAndUpdate(id, updatedDevice, { new: true });
    res.status(200).json({result: "Success!"});
  }

};

export const deleteDevice = async (req, res) => {
  const { id } = req.params;
  const {userName} = req.body;
  console.log("Delete: ", id, "by: ", userName);

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send({message: "Invalid!"});
  const delDevice = await DeviceSchema.findById(id);
  try{
    const deletedDevice = await DeviceSchema.findByIdAndDelete(id);
    const log = {userName, deviceId: deletedDevice.deviceId, deviceName: deletedDevice.name, action: 'delete', details: {objId: id}, result: 'success'};
    await createLog(log);
    res.status(200).json({message: "Success!"});
  } catch(error ) {
    const log = {userName, deviceId: delDevice.deviceId, deviceName: delDevice.name, action: 'delete', details: {objId: id}, result: 'error'};
    await createLog(log);
    res.status(400).json({ message: error.message });
  }
};
