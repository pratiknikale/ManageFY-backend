const express = require("express");
const app = express();
const taskList = express.Router();
let task = require("../models/task");
let users = require("../models/users");
const auth = require("../middleware/auth");

taskList.get("/get", auth, (req, res) => {
  try {
    const mylist = async () => {
      const user = req.userID;
      const data = await task.find({userID: user});
      res.json(data);
      // console.log(data);
    };

    mylist();
  } catch (err) {
    console.log(err);
  }
});

taskList.get("/getId/:id", auth, (req, res) => {
  try {
    const mylist = async () => {
      const user = req.userID;
      const data = await task.findOne({userID: user, _id: req.params.id});
      res.json(data);
      // console.log(data);
    };

    mylist();
  } catch (err) {
    console.log(err);
  }
});

taskList.put("/updateStatus", auth, (req, res, next) => {
  console.log(req.body);
  try {
    const mylist = async () => {
      const user = req.userID;
      const id = req.body.id;
      const status = req.body.status;
      const stask = req.body.stask;
      // const subtaskIndex = req.body.subtaskIndex;

      task.updateOne(
        {userID: user, _id: id, "sub_tasks.stask": stask},
        {
          $set: {"sub_tasks.$.status": status},
        },
        (error, data) => {
          if (error) {
            return next(error);
          } else {
            res.json(data);
            console.log("status updated successfully!");
          }
        }
      );
    };

    mylist();
  } catch (err) {
    console.log(err);
  }
});

taskList.put("/edit", auth, (req, res, next) => {
  // console.log(req.body.data)
  try {
    const mylist = async () => {
      const user = req.userID;
      const id = req.body.id;
      task.updateOne(
        {userID: user, _id: id},
        {
          task: req.body.data.task,
          task_name: req.body.data.task_name,
          sub_tasks: req.body.data.sub_tasks,
        },
        (error, data) => {
          if (error) {
            return next(error);
            console.log(error);
          } else {
            res.json(data);
            console.log("item updated successfully!");
          }
        }
      );
    };

    mylist();
  } catch (err) {
    console.log(err);
  }
});

taskList.post("/insert", auth, (req, res) => {
  //   console.log(req.body);
  try {
    const addTask = async () => {
      const user = req.userID;
      const taskName = req.body.item.taskName;
      const discription = req.body.item.discription;
      const subTask = req.body.item.subTask;
      const assignedBy = req.body.item.assignedBy;
      const date = new Date();
      const day = date.getDate();
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      const hours = date.getHours();
      const min = date.getMinutes();
      const t = date.toLocaleTimeString();
      const d = date.toLocaleDateString();

      if (assignedBy !== "private") {
        const data = await users.findOne({_id: assignedBy});
        const assigneeName = data.firstName + " " + data.lastName;
        //   res.json(data);

        const newTask = new task({
          userID: user,
          updated_at: date,
          task: discription,
          task_name: taskName,
          sub_tasks: subTask,
          assignedBy: assignedBy,
          assigneeName: assigneeName,
        });

        const result = await newTask.save();
        res.send(result);
      } else {
        console.log("assigned by is set to " + assignedBy);
        const newTask = new task({
          userID: user,
          updated_at: date,
          task: discription,
          task_name: taskName,
          sub_tasks: subTask,
          assignedBy: assignedBy,
          assigneeName: "private",
        });

        const result = await newTask.save();
        res.send(result);
      }
    };
    addTask().then(() => {
      console.log("successfully inserted");
    });
  } catch (err) {
    console.log(err);
  }
});

taskList.delete("/delete/:id", (req, res) => {
  try {
    // console.log(req.params.id);
    const mylist = async () => {
      const data = await task.findByIdAndRemove(req.params.id);
      res.json(data);
      // console.log(data);
    };

    mylist();
  } catch (err) {
    console.log(err);
  }
});

module.exports = taskList;
