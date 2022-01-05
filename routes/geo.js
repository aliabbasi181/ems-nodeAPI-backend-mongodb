var express = require("express");
const GeoController = require("../controllers/GeoController");

var router = express.Router();

router.get("/", GeoController.checkUserFenseStatus);
// router.get("/:id", BookController.bookDetail);
// router.post("/", BookController.bookStore);
// router.put("/:id", BookController.bookUpdate);
// router.delete("/:id", BookController.bookDelete);

module.exports = router;