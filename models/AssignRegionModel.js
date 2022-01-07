var mongoose = require("mongoose");

var AssignRegionSchema = new mongoose.Schema({
    user: { type: String, required: true },
    region: { type: String, required: true },
    date: {type: String},
    startTime: {type: String},
    endTime: {type: String},
}, {timestamps: true});


module.exports = mongoose.model("AssignRegion", AssignRegionSchema);