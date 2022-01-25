const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router();
const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");
let Users = require("../models/users");

router.post("/", auth, async (req, res) => {
  const {content, chatId} = req.body;

  if (!content || !chatId) {
    console.log("invalid data passed into request");
    return res.status(400);
  }

  var newMessage = {
    sender: req.userID,
    content: content,
    chat: chatId,
  };

  try {
    var message = await Message.create(newMessage);
    message = await message.populate("sender", "firstName lastName");
    message = await message.populate("chat");
    message = await Users.populate(message, {
      path: "chat.users",
      select: "firstName lastName email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,
    });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

router.get("/:chatId", auth, async (req, res) => {
  try {
    const message = await Message.find({chat: req.params.chatId})
      .populate("sender", "firstName lastName email")
      .populate("chat");

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = router;
