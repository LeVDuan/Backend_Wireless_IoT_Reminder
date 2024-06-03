import DeviceSchema from "../models/device.js";
import mongoose from "mongoose";

export const getAllDevices = async (req, res) => {
  try {
    let deviceList = await DeviceSchema.find().sort({ deviceId: 1 });
    // deviceList.sort((a, b) => a.deviceId - b.deviceId)

    res.status(200).json({ devices: deviceList, total: deviceList.length });
  } catch (error) {
    res.status(400).json({ result:"Failed!" });
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
    res.status(404).json({ result:"Failed!"});
  }
};

export const getDevice = async (req, res) => {
  try {
    const deviceId = req.query.deviceId
    const device = await DeviceSchema.find({ deviceId: deviceId });
    res
      .status(200)
      .json({device});
  } catch (error) {
    res.status(404).json({ result:"Failed!" });
  }
};


export const addDevice = async (req, res) => {
  const { deviceId, name } = req.body;
  console.log(req.body)
  const newDevice = new DeviceSchema({ deviceId, name });

  try {
    await newDevice.save();
    res.status(201).json({result: "Success!"});
  } catch (error) {
    res.status(409).json({ result: "Failed!" });
  }
};

export const renameDevice = async (req, res) => {
  const { id } = req.params;
  console.log(id)
  const { newName } = req.body;
  console.log(req.body);
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send({result: "not found"});

  const renamedDevice = { _id: id, name: newName };
  await DeviceSchema.findByIdAndUpdate(id, renamedDevice, { new: true });
  res.json({result: "Success!"});
};

export const updateCounter = async (req, res) => {
  const { id } = req.params;
  const { ctrlType } = req.body;
  
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send({result: "not found"});
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
  res.json({result: "Success!"});
};

export const updateStatus = async (req, res) => {

  const { id } = req.params;
  if(id === "all") {
      try {
        const updates = req.body.update; 
        const deviceIdsToUpdate = updates.map(update => update.deviceId);

        for (const update of updates) {
            const { deviceId, batteryStatus } = update;
            await DeviceSchema.updateMany(
                { deviceId },
                { $set: { batteryStatus, isActive: true } }
            );
        }

        await DeviceSchema.updateMany(
            { deviceId: { $nin: deviceIdsToUpdate } },
            { $set: { isActive: false } }
        );

        res.status(200).json({result: "Success!"});
    } catch (error) {
        res.status(500).json({result: "server error"} );
    }

  } else {

    const { isActive, batteryStatus } = req.body;
    const lastUpdated = new Date()
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).send({result: "not found"});
    const updatedDevice = { _id: id, isActive, batteryStatus, lastUpdated };
    await DeviceSchema.findByIdAndUpdate(id, updatedDevice, { new: true });
    res.json({result: "Success!"});
  }

};


export const deleteDevice = async (req, res) => {
  const { id } = req.params;

  console.log("Delete ", id);

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send({result: "not found"});

  await DeviceSchema.findByIdAndDelete(id);
  res.json({result: "Success!"});
};
