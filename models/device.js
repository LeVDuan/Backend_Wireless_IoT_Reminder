import mongoose from "mongoose";

const deviceSchema = mongoose.Schema({
    deviceId: {
        type: Number,
        require: true
    },
    name: String,
    lastUpdated: {
        type: Date,
        default: new Date(),
    }, 
    batteryStatus: Number,
    isActive: Boolean
});

const DeviceSchema = mongoose.model('Device', deviceSchema);
export default DeviceSchema;