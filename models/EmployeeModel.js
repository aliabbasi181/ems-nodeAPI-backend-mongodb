const { Schema } = require("mongoose");
var mongoose = require("mongoose");

var EmployeeSchema = new mongoose.Schema({
	name: {type: String, required: true},
	email: {type: String, required: true},
	password: {type: String, required: true},
	phone: {type: String},
	cnic: {type: String},
	role: {type: String, required: true},
	designation: {type: String},
	gender: {type: String},
	address: {type: String},
	isConfirmed: {type: Boolean, required: true, default: 0},
	confirmOTP: {type: String, required:false},
	otpTries: {type: Number, required:false, default: 0},
	status: {type: Boolean, required: true, default: 1},
    user: { type: Schema.ObjectId, ref: "User", required: true },
}, {timestamps: true});


module.exports = mongoose.model("Employee", EmployeeSchema);