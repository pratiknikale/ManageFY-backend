const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router();
const Chat = require("../models/chatModel");
let Users = require("../models/users");

router.post("/", auth, async (req, res) => {
  const {userId} = req.body;
  if (!userId) {
    console.log("userid not cought with request data");
    return res.status(400);
  }

  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [{users: {$elemMatch: {$eq: req.userID}}}, {users: {$elemMatch: {$eq: userId}}}],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await Users.populate(isChat, {
    path: "latestmessage.sender",
    select: "firstName lastName email",
  });

  if (isChat.length > 0) {
    res.status(200).send({chat: isChat[0], AlteadyExsists: true});
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.userID, userId],
      notificationUsers: [userId],
    };
    try {
      const createdChat = await Chat.create(chatData);

      const FullChat = await Chat.findOne({_id: createdChat.id})
        .populate("users", "-password")
        .populate("notificationUsers", "_id");

      res.status(200).send({chat: FullChat, AlteadyExsists: false});
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});
router.get("/", auth, async (req, res) => {
  try {
    Chat.find({users: {$elemMatch: {$eq: req.userID}}})
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .populate("notificationUsers", "_id")
      .sort({updatedAt: -1})
      .then(async (results) => {
        results = await Users.populate(results, {
          path: "latestMessage.sender",
          select: "firstName lastName email",
        });
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});
router.post("/group", auth, async (req, res) => {
  if (!req.body.users || !req.body.name) return res.status(400).send({message: "please fill all fields"});
  var users = req.body.users;

  if (users.length < 2) return res.status(400).send({message: "must be more than 2 users in group"});

  users.push(req.userID);
  let otherThanLoggedUser = users.filter((users) => {
    return users !== req.userID.toString();
  });

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.userID,
      notificationUsers: otherThanLoggedUser,
    });

    const FullGroupChat = await Chat.findOne({_id: groupChat._id})
      .populate("users", "-password")
      .populate("latestMessage")
      .populate("groupAdmin", "-password")
      .populate("notificationUsers", "_id");
    res.status(200).send(FullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});
router.put("/rename", auth, async (req, res) => {
  const {chatId, chatName} = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName,
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("latestMessage")
    .populate("groupAdmin", "-password")
    .populate("notificationUsers", "_id");

  if (!updatedChat) {
    res.status(400);
    throw new Error("chat not found");
  } else {
    res.json(updatedChat);
  }
});
router.put("/groupadd", auth, async (req, res) => {
  const {chatId, userId} = req.body;

  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: {users: userId, notificationUsers: userId},
    },
    {new: true}
  )
    .populate("users", "-password")
    .populate("latestMessage")
    .populate("groupAdmin", "-password")
    .populate("notificationUsers", "_id");

  if (!added) {
    res.status(400);
    throw new Error("chat not found");
  } else {
    res.json(added);
  }
});
router.put("/groupremove", auth, async (req, res) => {
  const {chatId, userId} = req.body;

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: {users: userId, notificationUsers: userId},
      // $pull: {notificationUsers: userId},
    },
    {new: true}
  )
    .populate("users", "-password")
    .populate("latestMessage")
    .populate("groupAdmin", "-password")
    .populate("notificationUsers", "_id");

  if (!removed) {
    res.status(400);
    throw new Error("chat not found");
  } else {
    res.json(removed);
  }
});

router.put("/setChatMessageRead", auth, async (req, res) => {
  // input: req.body.userId ...... id of user who should be removed from notificationUsers

  // console.log(req.body.chatId);
  let userRemoved;

  if (req.body.timeStampUpdate) {
    await Chat.findByIdAndUpdate(req.body.chatId, {
      $pull: {notificationUsers: req.body.userId},
    })
      .populate("users", "-password")
      .populate("latestMessage")
      .populate("groupAdmin", "-password")
      .populate("notificationUsers", "_id")
      .then(async (results) => {
        results = await Users.populate(results, {
          path: "latestMessage.sender",
          select: "firstName lastName email",
        });
        res.status(200).send(results);
      });
  } else {
    await Chat.findByIdAndUpdate(
      req.body.chatId,
      {
        $pull: {notificationUsers: req.body.userId},
      },
      {timestamps: false}
    )
      .populate("users", "-password")
      .populate("latestMessage")
      .populate("groupAdmin", "-password")
      .populate("notificationUsers", "_id")
      .then(async (results) => {
        results = await Users.populate(results, {
          path: "latestMessage.sender",
          select: "firstName lastName email",
        });
        res.status(200).send(results);
      });
  }
});

module.exports = router;
