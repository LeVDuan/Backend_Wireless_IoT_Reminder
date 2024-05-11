import mongoose from "mongoose";

const deviceSchema = mongoose.Schema({
    device_id: Number,
    name: String,
    last_update: String,
    pin: Number,
    status: Number
});

const DeviceInfo = mongoose.model('DeviceInfo', deviceSchema);
export default DeviceInfo;