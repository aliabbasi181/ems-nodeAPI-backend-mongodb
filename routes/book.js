var express = require("express");
const BookController = require("../controllers/BookController");
const GeoController = require("../controllers/GeoController");

var router = express.Router();

router.get("/", BookController.bookList);
router.get("/:id", BookController.bookDetail);
router.post("/", BookController.bookStore);
router.put("/:id", BookController.bookUpdate);
router.delete("/:id", BookController.bookDelete);
router.get("/status", GeoController.checkUserFenseStatus);

module.exports = router;