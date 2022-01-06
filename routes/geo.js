var express = require("express");
const GeoController = require("../controllers/GeoController");

var router = express.Router();

router.get("/", GeoController.checkUserFenseStatus);

module.exports = router;