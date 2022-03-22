const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
const EmployeeModel = require("../models/EmployeeModel");
mongoose.set("useFindAndModify", false);
//helper file to prepare responses.
const apiResponse = require("../helpers/apiResponse");
const utility = require("../helpers/utility");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mailer = require("../helpers/mailer");
const { constants } = require("../helpers/constants");


// creating new employee
exports.register = [
    auth,
	body("email").isLength({ min: 1 }).trim().withMessage("Email must be specified.")
		.isEmail().withMessage("Email must be a valid email address.").custom((value) => {
			return EmployeeModel.findOne({email : value}).then((user) => {
				if (user) {
					return Promise.reject("E-mail already in use");
				}
			});
		}),
	body("password").isLength({ min: 6 }).trim().withMessage("Password must be 6 characters or greater."),
	// Process request after validation and sanitization.
	(req, res) => {
		//console.log(req.user);
		try {
			// Extract the validation errors from a request.
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				// Display sanitized values/errors messages.
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}else {
				//hash input password
				bcrypt.hash(req.body.password,10,function(err, hash) {
					// generate OTP for confirmation
					let otp = utility.randomNumber(4);
					// Create User object with escaped and trimmed data
					var employee = new EmployeeModel(
						{
							name: req.body.name,
							email: req.body.email,
							password: hash,
							cnic: req.body.cnic,
							role: req.body.role,
							designation: req.body.designation,
							confirmOTP: otp,
							isConfirmed: true,
                            user: req.user._id
						}
					);
                    console.log(employee)
					// Html email body
					let html = "<p>Please Confirm your Account.</p><p>OTP: "+otp+"</p>";
					// Send confirmation email
					mailer.send(
						constants.confirmEmails.from, 
						req.body.email,
						"Confirm Account",
						html
					).then(function(){
						// Save user.
						employee.save(function (err) {
							if (err) { return apiResponse.ErrorResponse(res, err); }
							let employeeData = {
								_id: employee._id,
								name: req.body.name,
								email: req.body.email,
								cnic: req.body.cnic,
								role: req.body.role,
								designation: req.body.designation,
							};
							return apiResponse.successResponseWithData(res,"Registration Success.", employeeData);
						});
					}).catch(err => {
						console.log(err);
						return apiResponse.ErrorResponse(res,err);
					}) ;
				});
			}
		} catch (err) {
			//throw error in json response with status 500.
            console.log(err);
			return apiResponse.ErrorResponse(res, err);
		}
	}];

	exports.employeeList = [
		auth,
		function (req, res) {
			try {
				EmployeeModel.find({user: req.user._id},"").then((employee)=>{
					if(employee.length > 0){
						return apiResponse.successResponseWithData(res, "Operation success", employee);
					}else{
						return apiResponse.successResponseWithData(res, "Operation success", []);
					}
				});
			} catch (err) {
				//throw error in json response with status 500. 
				return apiResponse.ErrorResponse(res, err);
			}
		}
	];

	exports.employeeDetail = [
		auth,
		function (req, res) {
			console.log(req.params);
			try {
				EmployeeModel.findOne({_id: req.params.id},"").then((employee)=>{                
					if(employee !== null){
						return apiResponse.successResponseWithData(res, "Operation success", employee);
					}else{
						return apiResponse.successResponseWithData(res, "Employee not found", {});
					}
				});
			} catch (err) {
				//throw error in json response with status 500. 
				return apiResponse.ErrorResponse(res, err);
			}
		}
	];