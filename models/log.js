import mongoose from "mongoose";

const logSchema = mongoose.Schema({
    timestamp: {
        type: Date,
        default: Date.now,
        require: false
    },
    userName: String,
    deviceId: Number,
    deviceName: String,
    action: {
        type: String,
        required: true,
        enum: ['edit', 'add', 'delete', 'control'], 
    }, 
    details: {
        type: mongoose.Schema.Types.Mixed, 
        required: true
    },
    result: String
});

const LogSchema = mongoose.model('LogAction', logSchema);
export default LogSchema;