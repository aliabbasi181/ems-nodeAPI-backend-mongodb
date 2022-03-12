var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var AssignRegionSchema = new mongoose.Schema({
    employee: { type: String, required: true },
    region: { type: String, required: true },
    dateFrom: {type: String},
    dateTo: {type: String},
    startTime: {type: String},
    endTime: {type: String},
    user: { type: Schema.ObjectId, ref: "User", required: true },
}, {timestamps: true});


module.exports = mongoose.model("AssignRegion", AssignRegionSchema);