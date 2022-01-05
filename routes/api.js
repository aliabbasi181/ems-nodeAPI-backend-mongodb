var express = require("express");
var authRouter = require("./auth");
var bookRouter = require("./book");
var georouter = require("./geo");

var app = express();

app.use("/auth/", authRouter);
app.use("/book/", bookRouter);
app.use("/geo/", georouter);

module.exports = app;