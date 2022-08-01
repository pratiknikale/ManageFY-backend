const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const database = require("./config/db");
const listRoute = require("./routes/taskList");
const userAuthRoute = require("./routes/userAuth");
const manageManager = require("./routes/manageManager");
const manageEmployee = require("./routes/manageEmployee");
const UserEdit = require("./routes/UserEdit");
const ChatRoute = require("./routes/chatRoutes");
const MessageRoute = require("./routes/messageRoutes");
const clientUrl = require("./config/clientUrl");

// test

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
app.get("/", (req, res) => {
  res.send("hello");
  console.log("working");
});

// PORT
const port = process.env.PORT || 8000;
// const SocketPort = process.env.PORT || 8080;

// const io = require("socket.io")(process.env.PORT || 8080, {
//   cors: {
//     origin: [clientUrl.localUrl, "https://admin.socket.io"],
//   },
// });
const io = require("socket.io")(server, {
  cors: {
    origin: ["https://managefy.netlify.app/"],
  },
});

app.listen(port, () => {
  console.log("Listening on port " + port);
});

io.on("connection", (socket) => {
  // console.log(socket.id);
  socket.on("setup", (userId) => {
    socket.join(userId);
  });

  socket.on("Send-Message", (message, userOtherThanLoggedIDs, chat) => {
    chat.latestMessage = message;
    io.sockets.to(userOtherThanLoggedIDs).emit("Receive-Message", message, chat);
  });

  socket.on("create-new-Single-chat", (chat, userId) => {
    io.sockets.to([userId]).emit("Single-Chat-Created", chat);
  });

  socket.on("create-group", (chat, selectedGroupUserIds) => {
    io.sockets.to(selectedGroupUserIds).emit("new-group-chat", chat);
  });

  socket.on("group-edit", (chat, selectedGroupUserIds) => {
    io.sockets.to(selectedGroupUserIds).emit("new-group-edited", chat);
  });
});
