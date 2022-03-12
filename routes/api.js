var express = require("express");
var authRouter = require("./auth");
var bookRouter = require("./book");
var georouter = require("./geo");
var employeerouter = require("./employee");
var polygonrouter = require("./polygon");

var app = express();

app.use("/auth/", authRouter);
app.use("/book/", bookRouter);
app.use("/employee/", employeerouter);
app.use("/geo/", georouter);
app.use("/geo/polygon/", polygonrouter);

module.exports = app;