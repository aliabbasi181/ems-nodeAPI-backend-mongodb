var express = require("express");
const PolygonController = require("../controllers/PolygonController");

var router = express.Router();

router.get("/", PolygonController.polygonList);
router.get("/polygon", PolygonController.polygonDetail);
router.post("/", PolygonController.polygonStore);
// router.put("/:id", BookController.bookUpdate);
// router.delete("/:id", BookController.bookDelete);
// router.get("/status", GeoController.checkUserFenseStatus);

module.exports = router;