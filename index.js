const express = require("express");
const app = express();
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var database = require("./config/db");
const listRoute = require("./routes/taskList");
const userAuthRoute = require("./routes/userAuth");
const manageManager = require("./routes/manageManager");
const manageEmployee = require("./routes/manageEmployee");
const UserEdit = require("./routes/UserEdit");
const ChatRoute = require("./routes/chatRoutes");
const MessageRoute = require("./routes/messageRoutes");

// var path = require("path");
var cors = require("cors");
require("dotenv").config();

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
app.use(bodyParser.urlencoded({extended: false}));
app.use(cors());

// Static directory path
// app.use(express.static(path.join(__dirname, "dist/CRUDapp")));

// API root
app.use("/api", listRoute);
app.use("/userAuth", userAuthRoute);
app.use("/manageManager", manageManager);
app.use("/manageEmployee", manageEmployee);
app.use("/UserEdit", UserEdit);
app.use("/Chat", ChatRoute);
app.use("/Message", MessageRoute);

// Base Route
// app.get("/", (req, res) => {
//   res.send("hello");
//   console.log("working");
// });

// PORT
const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  console.log("Listening on port " + port);
});

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    // origin: "http://localhost:3000",
    origin: "https://todo-task-management.netlify.app/",
  },
});

io.on("connection", (socket) => {
  console.log("connected to socket");

  socket.on("chatSetup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("user joined room: " + room);
  });

  socket.on("new message", (newMessageReceived) => {
    var chat = newMessageReceived.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageReceived.sender._id) return;

      console.log("message sent");
      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });
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
