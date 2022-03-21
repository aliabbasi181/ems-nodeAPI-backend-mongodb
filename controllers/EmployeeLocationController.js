const EmployeeLocation = require("../models/EmployeeLocationModel");
const { body, validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);
const AssignPolygon = require("../models/AssignRegionModel");
const fs = require("fs");

const LatLng = class {
	constructor(lat, lng, time, inFence){
		this.lat = lat;
		this.lng = lng;
		this.time = time;
		this.inFence = inFence;
	}
};

exports.addUserLocation = [
  auth,
  (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(
          res,
          "Validation Error.",
          errors.array()
        );
      } else {
        var datesMatched = false;
        var timeMatched = false;
        AssignPolygon.find({ employee: req.user._id }, "").then(
          (assignFences) => {
			  //console.log(assignFences)
            if (assignFences.length > 0) {
              assignFences.forEach((assignFence) => {
                var dateFrom = assignFence.dateFrom;
                var dateTo = assignFence.dateTo;
                var dateCheck = req.body.date;
                var d1 = dateFrom.split("/");
                var d2 = dateTo.split("/");
                var c = dateCheck.split("/");
                var from = new Date(d1[2], parseInt(d1[1]) - 1, d1[0]); // -1 because months are from 0 to 11
                var to = new Date(d2[2], parseInt(d2[1]) - 1, d2[0]);
                var check = new Date(c[2], parseInt(c[1]) - 1, c[0]);
                if (check > from && check < to) {
                  datesMatched = true;
                } else if (
                  from.getDate() === check.getDate() ||
                  to.getDate() === check.getDate()
                ) {
                  datesMatched = true;
                } else {
                  datesMatched = false;
                }
                if (datesMatched) {
                  var timeFrom = "01/01/2011 " + assignFence.startTime + ":00";
                  var timeTo = "01/01/2011 " + assignFence.endTime + ":00";
                  var timeCheck = "01/01/2011 " + req.body.time + ":00";
                  if (
                    Date.parse(timeCheck) > Date.parse(timeFrom) &&
                    Date.parse(timeCheck) < Date.parse(timeTo)
                  ) {
                    timeMatched = true;
                  } else if (
                    Date.parse(timeCheck) === Date.parse(timeFrom) ||
                    Date.parse(timeCheck) === Date.parse(timeTo)
                  ) {
                    timeMatched = true;
                  } else {
                    timeMatched = false;
                  }
                  if (timeMatched) {
                    EmployeeLocation.find({
                      date: req.body.date,
                      employee: req.user._id,
                      fence: assignFence._id,
                    }).then((locations) => {
                      if (locations.length > 0) {
                        console.log("got location");
                      } else {
						var userLocation = [];
						userLocation.push(new LatLng(req.body.lat, req.body.lng, req.body.time, true));
						userLocation.push(new LatLng(req.body.lat, req.body.lng, req.body.time, false));
                        var employeeLocation = new EmployeeLocation({
                          employee: req.user._id,
                          fence: assignFence.region,
                          date: req.body.date,
                          locations: userLocation,
                        });
						console.log(employeeLocation);
                      }
                    });
                  }
                }
              });
              return apiResponse.successResponseWithData(
                res,
                "Operation success",
                assignFences
              );
            } else {
              return apiResponse.successResponseWithData(
                res,
                "Operation success",
                []
              );
            }
          }
        );
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
  },
];
