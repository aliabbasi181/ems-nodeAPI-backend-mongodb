const Polygon = require("../models/PolygonModel");
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

// Book Schema
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
	auth,
	function (req, res) {
		try {
			Polygon.find().then((polygon)=>{
				if(polygon.length > 0){
					return apiResponse.successResponseWithData(res, "Operation success", polygons);
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
	auth,
	function (req, res) {
		try {
			console.log(req.body);
			Book.findOne({_id: req.body.id}).then((polygon)=>{                
				if(book !== null){
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
	body("name", "Name must not be empty.").isLength({ min: 1 }),
	sanitizeBody("*").escape(),
	(req, res) => {
		console.log(req.body);
		return;
		try {
			const errors = validationResult(req);
			var polygon = new Polygon(
				{ 	name: req.body.name,
					user: req.user,
					points: [{
						lat: req.points.lat,
						lng: req.points.lng
					}]
				});

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				//Save book.
				polygon.save(function (err) {
					if (err) { return apiResponse.ErrorResponse(res, err); }
					let polygonData = new PolygonData(polygon);
					return apiResponse.successResponseWithData(res,"Polygon add successfuly.", polygonData);
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
exports.bookUpdate = [
	auth,
	body("title", "Title must not be empty.").isLength({ min: 1 }).trim(),
	body("description", "Description must not be empty.").isLength({ min: 1 }).trim(),
	body("isbn", "ISBN must not be empty").isLength({ min: 1 }).trim().custom((value,{req}) => {
		return Book.findOne({isbn : value,user: req.user._id, _id: { "$ne": req.params.id }}).then(book => {
			if (book) {
				return Promise.reject("Book already exist with this ISBN no.");
			}
		});
	}),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			var book = new Book(
				{ title: req.body.title,
					description: req.body.description,
					isbn: req.body.isbn,
					_id:req.params.id
				});

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				if(!mongoose.Types.ObjectId.isValid(req.params.id)){
					return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
				}else{
					Book.findById(req.params.id, function (err, foundBook) {
						if(foundBook === null){
							return apiResponse.notFoundResponse(res,"Book not exists with this id");
						}else{
							//Check authorized user
							if(foundBook.user.toString() !== req.user._id){
								return apiResponse.unauthorizedResponse(res, "You are not authorized to do this operation.");
							}else{
								//update book.
								Book.findByIdAndUpdate(req.params.id, book, {},function (err) {
									if (err) { 
										return apiResponse.ErrorResponse(res, err); 
									}else{
										let bookData = new BookData(book);
										return apiResponse.successResponseWithData(res,"Book update Success.", bookData);
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
exports.bookDelete = [
	auth,
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
		}
		try {
			Book.findById(req.params.id, function (err, foundBook) {
				if(foundBook === null){
					return apiResponse.notFoundResponse(res,"Book not exists with this id");
				}else{
					//Check authorized user
					if(foundBook.user.toString() !== req.user._id){
						return apiResponse.unauthorizedResponse(res, "You are not authorized to do this operation.");
					}else{
						//delete book.
						Book.findByIdAndRemove(req.params.id,function (err) {
							if (err) { 
								return apiResponse.ErrorResponse(res, err); 
							}else{
								return apiResponse.successResponse(res,"Book delete Success.");
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