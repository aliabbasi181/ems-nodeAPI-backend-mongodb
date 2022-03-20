const EmployeeLocation = require("../models/EmployeeLocationModel");
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);
const AssignPolygon = require("../models/AssignRegionModel");
const fs = require('fs')


exports.addUserLocation = [
	auth,
	(req, res) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				var datesMatched = false;
				var timeMatched = false;
                AssignPolygon.find({employee: req.user._id},"").then((assignFences)=>{
					if(assignFences.length > 0){
						assignFences.forEach(assignFence => {
							var dateFrom = assignFence.dateFrom;
							var dateTo = assignFence.dateTo;
							var dateCheck = req.body.date;
							var d1 = dateFrom.split("/");
							var d2 = dateTo.split("/");
							var c = dateCheck.split("/");
							var from = new Date(d1[2], parseInt(d1[1])-1, d1[0]);  // -1 because months are from 0 to 11
							var to   = new Date(d2[2], parseInt(d2[1])-1, d2[0]);
							var check = new Date(c[2], parseInt(c[1])-1, c[0]);
							if (check > from && check < to){
								datesMatched = true;
							}
							else if(from.getDate() === check.getDate() || to.getDate() === check.getDate())
							{
								datesMatched = true;
							}
							else{
								datesMatched = false;
							}
							if(datesMatched){
								var timeFrom = '01/01/2011 '+assignFence.startTime+':00';
								var timeTo = '01/01/2011 '+assignFence.endTime+':00';
								var timeCheck = '01/01/2011 '+req.body.time+':00';
								if(Date.parse(timeCheck) > Date.parse(timeFrom) &&Date.parse(timeCheck) < Date.parse(timeTo)){
									timeMatched = true;
								}
								else if(Date.parse(timeCheck) === Date.parse(timeFrom) || Date.parse(timeCheck) === Date.parse(timeTo)){
									timeMatched = true;
								}
								else{
									timeMatched = false;
								}
								if(timeMatched){
									// var employeeLocation = new EmployeeLocation(
									// 	{
									// 		employee: req.body.employee,
									// 		fence: req.body.fence,
									// 		date: req.body.date,
									// 		locations: req.body.location
									// 	});
									EmployeeLocation.find
								}
							}
						});
						return apiResponse.successResponseWithData(res, "Operation success", assignFences);
					}else{
						return apiResponse.successResponseWithData(res, "Operation success", []);
					}
				});
				// polygon.save(function (err) {
				// 	if (err) { return apiResponse.ErrorResponse(res, err); }
				// 	let polygonData = new PolygonData(polygon);
				// 	return apiResponse.successResponseWithData(res,"Fence add successfuly.", polygonData);
				// });
			}
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];



