const UserModel = require("../models/UserModel");
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
//helper file to prepare responses.
const apiResponse = require("../helpers/apiResponse");
const utility = require("../helpers/utility");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mailer = require("../helpers/mailer");
const { constants } = require("../helpers/constants");


//var polygon = [ [ 51.4926437585727, -0.0998991402774019 ], [ 51.485660465122706, -0.09652313232420885 ], [ 51.47600322930871, -0.09652313232420885 ], [ 51.482097146856134, -0.11054214564849565 ], [ 51.4923943741772, -0.09984192069153243 ] ];
//var polygon2 = [ [ 1, 1 ], [ 1, 2 ], [ 2, 2 ], [ 2, 1 ] ];


exports.checkUserFenseStatus = [
	function(req, res){
		let point = ""+req.body['userLocation'];
		let	x = parseFloat(point.toString().split(',')[0]);
		let	y = parseFloat(point.toString().split(',')[1]);
		
		if(isUserInFence(x,y)){
			return apiResponse.successResponseWithData(res, "In the fence");
		}
		else{
			return apiResponse.successResponseWithData(res, "Out of fence");
		}
		//return apiResponse.successResponseWithData(res, "Out of fence");
	}
];


function isUserInFence(x, y){
	
	let n = polygon.length;
    let p = new Point(x, y);
    console.log(p);
	if(isInside(polygon, n, p)){
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