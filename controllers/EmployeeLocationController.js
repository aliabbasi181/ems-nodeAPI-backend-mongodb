const EmployeeLocation = require("../models/EmployeeLocationModel");
const { body, validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);
const AssignPolygon = require("../models/AssignRegionModel");
const FenceModel = require("../models/PolygonModel");

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
					  var polygon = [];
					FenceModel.findById(assignFence.region, function (err, fence) {
						if(fence){
							fence.points.forEach((point)=> {
								polygon.push(new Point(parseFloat(point.lat),parseFloat(point.lng)));
							});
						}
					});
                    EmployeeLocation.find({
                      date: req.body.date,
					  assignFenceId: assignFence._id
                    }).then((locations) => {
                      if (locations.length > 0) {
						var oldLocations = [];
						locations[0]['locations'].forEach((loc) => {
							oldLocations.push(new LatLng(loc['lat'], loc['lng'], loc['time'], loc['inFence']))
						});
						var isInFence = isUserInFence(req.body.lat, req.body.lng, polygon);
						console.log(isInFence);
						oldLocations.push(new LatLng(req.body.lat, req.body.lng, req.body.time, false));
						var employeeLocation = new EmployeeLocation({
							employee: req.user._id,
							fence: assignFence.region,
							assignFenceId: assignFence._id,
							date: req.body.date,
							locations: oldLocations,
						  });
                        EmployeeLocation.findByIdAndUpdate(locations[0]['_id'], {'locations': oldLocations}, {},function (err) {
							if (err) { 
								return apiResponse.ErrorResponse(res, err); 
							}else{
								return apiResponse.successResponseWithData(res,"location added Success.", employeeLocation);
							}
						});
                      } else {
						var userLocation = [];
						userLocation.push(new LatLng(req.body.lat, req.body.lng, req.body.time, true));
                        var employeeLocation = new EmployeeLocation({
                          employee: req.user._id,
                          fence: assignFence.region,
						  assignFenceId: assignFence._id,
                          date: req.body.date,
                          locations: userLocation,
                        });
						employeeLocation.save(function (err) {
							if (err) { return apiResponse.ErrorResponse(res, err); }
							return apiResponse.successResponseWithData(res,"location added Success.", employeeLocation);
						});
                      }
                    });
                  }
				  else{
					return apiResponse.ErrorResponse(res, "you are not allowed to save location at this time in this fence");
				  }
                }
              });
				//return apiResponse.ErrorResponse(res, "No assigned fence to you at this date and time");
			  
            } else {
				return apiResponse.ErrorResponse(res, "No assigned fence to you");
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




function isUserInFence(x, y, fence){
	x = parseFloat(x);
	y = parseFloat(y);
	let n = fence.length;
    let p = new Point(x, y);
	if(isInside(fence, n, p)){
		return true;
	}
	else{
		return false;
	}
	
}


class Point
{
    constructor(x,y)
    {
        this.x = x;
        this.y = y;
    }
}


  
// Given three collinear points p, q, r,
    // the function checks if point q lies
    // on line segment 'pr'
function onSegment(p,q,r)
{
     if (q.x <= Math.max(p.x, r.x) &&
            q.x >= Math.min(p.x, r.x) &&
            q.y <= Math.max(p.y, r.y) &&
            q.y >= Math.min(p.y, r.y))
        {
            return true;
        }
        return false;
}
  
// To find orientation of ordered triplet (p, q, r).
    // The function returns following values
    // 0 --> p, q and r are collinear
    // 1 --> Clockwise
    // 2 --> Counterclockwise
function orientation(p,q,r)
{
    let val = (q.y - p.y) * (r.x - q.x)
                - (q.x - p.x) * (r.y - q.y);
   
        if (val == 0)
        {
            return 0; // collinear
        }
        return (val > 0) ? 1 : 2; // clock or counterclock wise
}
  
// The function that returns true if
    // line segment 'p1q1' and 'p2q2' intersect.
function  doIntersect(p1,q1,p2,q2)
{
    // Find the four orientations needed for
        // general and special cases
        let o1 = orientation(p1, q1, p2);
        let o2 = orientation(p1, q1, q2);
        let o3 = orientation(p2, q2, p1);
        let o4 = orientation(p2, q2, q1);
   
        // General case
        if (o1 != o2 && o3 != o4)
        {
            return true;
        }
   
        // Special Cases
        // p1, q1 and p2 are collinear and
        // p2 lies on segment p1q1
        if (o1 == 0 && onSegment(p1, p2, q1))
        {
            return true;
        }
   
        // p1, q1 and p2 are collinear and
        // q2 lies on segment p1q1
        if (o2 == 0 && onSegment(p1, q2, q1))
        {
            return true;
        }
   
        // p2, q2 and p1 are collinear and
        // p1 lies on segment p2q2
        if (o3 == 0 && onSegment(p2, p1, q2))
        {
            return true;
        }
   
        // p2, q2 and q1 are collinear and
        // q1 lies on segment p2q2
        if (o4 == 0 && onSegment(p2, q1, q2))
        {
            return true;
        }
   
        // Doesn't fall in any of the above cases
        return false;
}
  
// Returns true if the point p lies
    // inside the polygon[] with n vertices
function  isInside(polygon,n,p)
{
    // There must be at least 3 vertices in polygon[]
        if (n < 3)
        {
            return false;
        }
        // Create a point for line segment from p to infinite
        let extreme = new Point(10000, p.y);
        // Count intersections of the above line
        // with sides of polygon
        let count = 0, i = 0;
        do
        {
            let next = (i + 1) % n;
            // Check if the line segment from 'p' to
            // 'extreme' intersects with the line
            // segment from 'polygon[i]' to 'polygon[next]'
            if (doIntersect(polygon[i], polygon[next], p, extreme))
            {
                // If the point 'p' is colinear with line
                // segment 'i-next', then check if it lies
                // on segment. If it lies, return true, otherwise false
                if (orientation(polygon[i], p, polygon[next]) == 0)
                {
                    return onSegment(polygon[i], p,
                                    polygon[next]);
                }
   
                count++;
            }
            i = next;
        } while (i != 0);
   
        // Return true if count is odd, false otherwise
        return (count % 2 == 1); // Same as (count%2 == 1)
}
let polygon = [new Point(51.4926437585727,-0.09932693656067305),
	new Point(51.48986482072766,-0.0993841561465425),
	new Point(51.48583862258527,-0.09640869315246993),
	new Point(51.47593195168967,-0.0962370317755168),
	new Point(51.482025878759956,-0.1105993652343651),
    new Point(51.492715011705485,-0.0996702593145793),
];