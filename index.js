const express = require("express");
const app = express();
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var database = require("./config/db");
const listRoute = require("./routes/list");
// var path = require("path");
var cors = require("cors");
const userAuth = require("./routes/userAuth");
require('dotenv').config();

mongoose.Promise = global.Promise;
mongoose
  .connect(database.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(
    () => {
      console.log("Database sucessfully connected ");
    },
    (error) => {
      console.log("Database error: " + error);
    }
  );

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false,}));
app.use(cors());

// Static directory path
// app.use(express.static(path.join(__dirname, "dist/CRUDapp")));

// API root
app.use("/api", listRoute);
app.use("/userAuth", userAuth);

// Base Route
// app.get("/", (req, res) => {
//   res.send("hello");
//   console.log("working");
// });

// PORT
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log("Listening on port " + port);
});

// 404 Handler
// app.use((req, res, next) => {
//   next(createError(404));
// });

// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "dist/CRUDapp/index.html"));
// });

// error handler
// app.use(function (err, req, res, next) {
//   console.error(err.message);
//   if (!err.statusCode) err.statusCode = 500;
//   res.status(err.statusCode).send(err.message);
// });
