const express = require("express");
const app = express();
const UserEdit = express.Router();
let users = require("../models/users");
let task = require("../models/task");
const Chat = require("../models/chatModel");
const auth = require("../middleware/auth");

UserEdit.get("/getUser/:id", auth, (req, res) => {
  const role = req.headers.role.split(" ")[1];
  if (role === "manager") {
    try {
      const EUser = async () => {
        const editUserId = req.params.id;
        const data = await users.findOne({_id: editUserId});
        // console.log(data);
        res.json({id: data._id, firstName: data.firstName, lastName: data.lastName, role: data.role});
      };

      EUser();
    } catch (err) {
      console.log(err);
    }
  } else {
    res.status(400).json({message: "Not authorised to access this data"});
  }
});

UserEdit.put("/editUser", auth, (req, res, next) => {
  //   console.log(req.body.data);
  try {
    const EUser = async () => {
      const UserId = req.body.data.id;
      users.updateOne(
        {_id: UserId},
        {
          firstName: req.body.data.firstName,
          lastName: req.body.data.lastName,
          role: req.body.data.role,
        },
        (error, data) => {
          if (error) {
            return next(error);
          } else {
            res.json(data);
            //   console.log("item updated successfully!");
          }
        }
      );
    };

    EUser();
  } catch (err) {
    console.log(err);
  }
});

UserEdit.delete("/deleteUser/:id", auth, (req, res) => {
  try {
    const DUser = async () => {
      const id = req.params.id;
      await task.remove({userID: id});
      const delUser = await users.findByIdAndRemove(id);
      res.json(delUser);
      // console.log(data);
    };

    DUser();
  } catch (err) {
    console.log(err);
  }
});

UserEdit.post("/searchUser", auth, (req, res) => {
  // const role = req.headers.role.split(" ")[1];
  // console.log(req.body.role);
  const role = req.body.role === "manager" ? "employee" : "manager";

  try {
    const search = async () => {
      const keyword = req.query.search
        ? {
            $or: [
              {firstName: {$regex: req.query.search, $options: "i"}},
              {lastName: {$regex: req.query.search, $options: "i"}},
            ],
          }
        : {};
      const searchedUsers = await users.find(keyword).find({role: {$ne: role}});

      res.json(searchedUsers);

      // res.send(searchedUsers);
    };

    search();
  } catch (err) {
    console.log(err);
  }
});

UserEdit.get("/searchAllUser", auth, (req, res) => {
  // const role = req.headers.role.split(" ")[1];
  // console.log(req.body.role);
  // const role = req.body.role === "manager" ? "employee" : "manager";

  try {
    const search = async () => {
      const keyword = req.query.search
        ? {
            $or: [
              {firstName: {$regex: req.query.search, $options: "i"}},
              {lastName: {$regex: req.query.search, $options: "i"}},
            ],
          }
        : {};
      const searchedUsers = await users.find(keyword).find({_id: {$ne: req.userID}});

      res.json(searchedUsers);

      // res.send(searchedUsers);
    };

    search();
  } catch (err) {
    console.log(err);
  }
});

UserEdit.get("/getAllUsers", auth, (req, res) => {
  // console.log(req.body);
  // const role = req.headers.role.split(" ")[1];

  try {
    const mylist = async () => {
      const user = req.userID;
      const data = await users.find();
      res.json(data);
    };

    mylist();
  } catch (err) {
    console.log(err);
  }
});

module.exports = UserEdit;
