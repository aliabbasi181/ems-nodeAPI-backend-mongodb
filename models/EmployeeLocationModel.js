var mongoose = require("mongoose");
var Schema = mongoose.Schema;


var EmployeeLocationSchema = new Schema({
    employee: { type: String, required: true },
    fence: { type: String, required: true },
    date: { type: String},
    locations: {type: Array},
}, {timestamps: true});

module.exports = mongoose.model("EmployeeLocation", EmployeeLocationSchema);
