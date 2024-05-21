import mongoose from "mongoose";

const logSchema = mongoose.Schema({
    timestamp: {
        type: Date,
        default: Date.now,
        require: false
    },
    userName: String,
    deviceId: String,
    action: {
        type: String,
        required: true,
        enum: ['edit', 'add', 'delete', 'control'], 
    }, 
    details: {
        type: mongoose.Schema.Types.Mixed, 
        required: true
    }
});

const LogSchema = mongoose.model('LogAction', logSchema);
export default LogSchema;