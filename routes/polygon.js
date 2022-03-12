var express = require("express");
const PolygonController = require("../controllers/PolygonController");

var router = express.Router();

router.get("/", PolygonController.polygonList);
router.get("/polygonDetail", PolygonController.polygonDetail);
router.post("/", PolygonController.polygonStore);
router.post("/assign-polygon", PolygonController.polygonAssign);
router.post("/update", PolygonController.polygonUpdate);
router.delete("/", PolygonController.polygonDelete);
// router.get("/status", GeoController.checkUserFenseStatus);

module.exports = router;