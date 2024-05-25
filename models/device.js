import mongoose from "mongoose";

const deviceSchema = mongoose.Schema({
    deviceId: {
        type: Number,
        require: true
    },
    name: {
        type: String,
        require: true
    },
    lastUpdated: {
        type: Date,
        default: new Date(),
    },
    batteryStatus: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    VBRCount: {
        type: Number,
        default: 0
    },
    LGTCount: {
        type: Number,
        default: 0
    },
    VLGCount: {
        type: Number,
        default: 0
    }
});

const DeviceSchema = mongoose.model('Device', deviceSchema);
export default DeviceSchema;