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
const updateCtrlCounter = async (id, ctrlType) => {
  
  if (!mongoose.Types.ObjectId.isValid(id))
    return console.log("Device not found!")
  switch (ctrlType) {
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
};
export const getAllDevices = async (req, res) => {
  try {
    let deviceList = await DeviceSchema.find().sort({ deviceId: 1 });
    // deviceList.sort((a, b) => a.deviceId - b.deviceId)

    res.status(200).json({ devices: deviceList, total: deviceList.length });
  } catch (error) {
    res.status(400).json({ message: error.message});
  }
};

export const getActiveDevices = async (req, res) => {
  try {
    const activeDevices = await DeviceSchema.find({ isActive: true });
    activeDevices.sort((a, b) => a.deviceId - b.deviceId)

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
    const {userName, deviceName, objId, type, deviceId, controlTime, periodTime, pauseTime } = req.body;
    if(type === 'Broadcast') {
      return res.status(200).json({command: "BRD"});
    } else if(type === 'Request') {
      if(deviceId === -1) {

        return res.status(200).json({command: "REQ"});
      } else {
        return res.status(200).json({command: `REQ ${deviceId}`})
      }
    } else {
      const command = type + ' ' + deviceId + ' ' + controlTime + ' ' + periodTime + ' ' + pauseTime;
      const log = { userName, deviceId, deviceName, action: "control", details : {
        objId,
        type,
        controlTime,
        periodTime,
        pauseTime},
        result: "success" };
      createLog(log);
      updateCtrlCounter(objId, type)
      console.log("command: ",command)
      return res.status(200).json({command})
    }  
};

export const addDevice = async (req, res) => {
  const { deviceId, name, userName } = req.body;
  
  console.log("add: ",req.body)
  const newDevice = new DeviceSchema({ deviceId, name });

  try {
    const objId = (await newDevice.save())._id;
    const log = {userName, deviceId, deviceName: name, action: 'add', details: {objId}, result: 'success'};
    createLog(log);
    res.status(201).json({message: "Success!"});
  } catch (error) {
    const log = {userName, deviceId, deviceName: name, action: 'add', details: {objId: ""}, result: 'error'};
    createLog(log);
    res.status(400).json({ message: error.message});
  }

};

export const renameDevice = async (req, res) => {
  const { id } = req.params;
  const { deviceId, oldName, newName, userName} = req.body;
  console.log("Delete: ", id, "info: ", req.body)

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send({message: "Device not found!"});

  const renamedDevice = { _id: id, name: newName };
  try {
    await DeviceSchema.findByIdAndUpdate(id, renamedDevice, { new: true });
    const log = {userName, deviceId, deviceName: newName, action: 'edit', details: { objId: id, oldName, newName }, result: 'success'};
    createLog(log);
    res.status(200).json({message: "Success!"});
  } catch (error) {
    const log = {userName, deviceId, deviceName: oldName, action: 'edit', details: {objId: id, oldName, newName}, result: 'error'};
    createLog(log);
    res.status(400).json({ message: error.message });
  }
};



export const updateStatus = async (req, res) => {
  const lastUpdated = new Date()

  const { id } = req.params;
  if(id === "all") {
      try {
        const updates = req.body.update; 
        const deviceIdsToUpdate = updates.map(update => update.deviceId);

        for (const update of updates) {
            const { deviceId, batteryStatus } = update;
            await DeviceSchema.updateMany(
                { deviceId },
                { $set: { batteryStatus, isActive: true, lastUpdated } }
            );
        }

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
    createLog(log);
    res.status(200).json({message: "Success!"});
  } catch(error ) {
    const log = {userName, deviceId: delDevice.deviceId, deviceName: delDevice.name, action: 'delete', details: {objId: id}, result: 'error'};
    createLog(log);
    res.status(400).json({ message: error.message });
  }
};
