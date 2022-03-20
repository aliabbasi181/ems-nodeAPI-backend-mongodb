var express = require("express");
const EmployeeController = require("../controllers/EmployeeController");
const EmployeeLocationController = require("../controllers/EmployeeLocationController");

var router = express.Router();

router.post("/register", EmployeeController.register);
router.get("/:id", EmployeeController.employeeDetail);
router.get("/", EmployeeController.employeeList);
router.post("/addLocation", EmployeeLocationController.addUserLocation);
// router.put("/:id", BookController.bookUpdate);
// router.delete("/:id", BookController.bookDelete);
// router.get("/status", GeoController.checkUserFenseStatus);

module.exports = router;