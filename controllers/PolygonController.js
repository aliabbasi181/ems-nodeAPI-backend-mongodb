const Polygon = require("../models/PolygonModel");
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);
//require("../models/LatLng");
// polygon Schema

class LatLng{
    constructor(x,y){
        this.lat = x;
        this.lng = y;
    }
}

function PolygonData(data) {
	this.id = data._id;
	this.name= data.name;
	this.points = data.points;
	this.createdAt = data.createdAt;
}

/**
 * Book List.
 * 
 * @returns {Object}
 */
exports.polygonList = [
	function (req, res) {
		try {
			Polygon.find().sort({'createdAt' : -1}).then((polygon)=>{
				if(polygon.length > 0){
					return apiResponse.successResponseWithData(res, "Operation success", polygon);
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

/**
 * Book Detail.
 * 
 * @param {string}      id
 * 
 * @returns {Object}
 */
exports.polygonDetail = [
	function (req, res) {
		try {
			console.log(req.body.id);
			Polygon.findOne({_id: req.body.id}).then((polygon)=>{                
				if(polygon !== null){
					let polygonData = new PolygonData(polygon);
					return apiResponse.successResponseWithData(res, "Operation success", polygonData);
				}else{
					return apiResponse.successResponseWithData(res, "Operation success", {});
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Book store.
 * 
 * @param {string}      title 
 * @param {string}      description
 * @param {string}      isbn
 * 
 * @returns {Object}
 */
exports.polygonStore = [
	auth,
	(req, res) => {
		try {
			const errors = validationResult(req);
			var polygon = new Polygon(
				{ 	name: req.body.name,
					user: req.user,
					points: req.body.points
				});
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				//Save book.
				polygon.save(function (err) {
					if (err) { return apiResponse.ErrorResponse(res, err); }
					let polygonData = new PolygonData(polygon);
					return apiResponse.successResponseWithData(res,"Fence add successfuly.", polygonData);
				});
			}
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Book update.
 * 
 * @param {string}      title 
 * @param {string}      description
 * @param {string}      isbn
 * 
 * @returns {Object}
 */
exports.polygonUpdate = [
	auth,
	(req, res) => {
		try {
			const errors = validationResult(req);
			var polygon = new Polygon(
				{ 	name: req.body.name,
					user: req.user,
					points: req.body.points
				});
			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				if(!mongoose.Types.ObjectId.isValid(req.body.id)){
					return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
				}else{
					Polygon.findById(req.body.id, function (err, foundPolygon) {
						if(foundBook === null){
							return apiResponse.notFoundResponse(res,"Book not exists with this id");
						}else{
							console.log(req.body.id);
							//Check authorized user
							if(foundPolygon.user.toString() !== req.user._id){
								return apiResponse.unauthorizedResponse(res, "You are not authorized to do this operation.");
							}else{
								//update book.
								Polygon.findByIdAndUpdate(req.body.id, polygon, {},function (err) {
									if (err) { 
										return apiResponse.ErrorResponse(res, err); 
									}else{
										let polygonData = new PolygonData(polygon);
										return apiResponse.successResponseWithData(res,"Book update Success.", polygonData);
									}
								});
							}
						}
					});
				}
			}
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Book Delete.
 * 
 * @param {string}      id
 * 
 * @returns {Object}
 */
exports.polygonDelete = [
	auth,
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.body.id)){
			return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
		}
		console.log(req.body.id);
		try {
			Polygon.findById(req.body.id, function (err, foundPolygon) {
				if(foundPolygon === null){
					return apiResponse.notFoundResponse(res,"Polygon not exists with this id");
				}else{
					//Check authorized user
					if(foundPolygon.user.toString() !== req.user._id){
						return apiResponse.unauthorizedResponse(res, "You are not authorized to do this operation.");
					}else{
						//delete book.
						Polygon.findByIdAndRemove(req.body.id,function (err) {
							if (err) { 
								return apiResponse.ErrorResponse(res, err); 
							}else{
								return apiResponse.successResponse(res,"Polygon delete Success.");
							}
						});
					}
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];