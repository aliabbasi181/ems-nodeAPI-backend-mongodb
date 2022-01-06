var express = require("express");
var authRouter = require("./auth");
var bookRouter = require("./book");
var georouter = require("./geo");
var polygonrouter = require("./polygon");

var app = express();

app.use("/auth/", authRouter);
app.use("/book/", bookRouter);
app.use("/geo/", georouter);
app.use("/geo/polygon/", polygonrouter);

module.exports = app;