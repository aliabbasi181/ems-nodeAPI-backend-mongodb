var express = require("express");
const EmployeeController = require("../controllers/EmployeeController");

var router = express.Router();

router.post("/register", EmployeeController.register);
// router.get("/:id", BookController.bookDetail);
// router.post("/", BookController.bookStore);
// router.put("/:id", BookController.bookUpdate);
// router.delete("/:id", BookController.bookDelete);
// router.get("/status", GeoController.checkUserFenseStatus);

module.exports = router;