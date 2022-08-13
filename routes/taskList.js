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
      const data = await task.find({userID: user}).populate("userID", "_id firstName lastName").sort({updated_at: -1});
      res.json(data);
      // console.log(data);
    };

    mylist();
  } catch (err) {
    console.log(err);
  }
});

taskList.get("/getmanagersAssignedTsk/:Id", auth, async (req, res) => {
  try {
    const managerId = req.params.Id;
    const data = await task
      .find({assignedBy: managerId})
      .populate("userID", "_id firstName lastName")
      .sort({updated_at: -1});
    res.json(data);
  } catch (err) {
    console.log(err);
  }
});

taskList.get("/searchAssignedTask", auth, (req, res) => {
  // const role = req.headers.role.split(" ")[1];
  // console.log(req.body.role);
  // const role = req.body.role === "manager" ? "employee" : "manager";

  try {
    const search = async () => {
      const keyword = req.query.search
        ? {
            $or: [
              // {"userID.firstName": {$regex: req.query.search, $options: "i"}},
              // {"userID.lastName": {$regex: req.query.search, $options: "i"}},
              {task_name: {$regex: req.query.search, $options: "i"}},
              {status: {$regex: req.query.search, $options: "i"}},
            ],
          }
        : {};
      const searchedTask = await task
        .find(keyword)
        .find({assignedBy: {$eq: req.userID}})
        .populate("userID", "_id firstName lastName")
        .sort({updated_at: -1});

      res.json(searchedTask);

      // res.send(searchedUsers);
    };

    search();
  } catch (err) {
    console.log(err);
  }
});

taskList.get("/getId/:id", auth, (req, res) => {
  try {
    const mylist = async () => {
      const data = await task.findOne({_id: req.params.id}).populate("userID", "_id firstName lastName");
      res.json(data);
    };

    mylist();
  } catch (err) {
    console.log(err);
  }
});

taskList.put("/updateSubTaskStatus", auth, (req, res, next) => {
  // console.log(req.body);
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

taskList.put("/updateFullTaskStatus", auth, async (req, res) => {
  console.log(req.body.status);
  try {
    const user = req.userID;
    const TaskId = req.body.id;
    const status = req.body.status === "pending" ? "pending" : "done";

    await task
      .updateOne(
        {userID: user, _id: TaskId},
        {
          status: status,
        }
      )
      .then(async () => {
        const updatedTask = await task.findOne({_id: TaskId}).populate("userID", "_id firstName lastName");
        if (!updatedTask) {
          throw new Error();
        } else {
          res.status(200).send(updatedTask);
        }
      });
  } catch (err) {
    console.log(err);
  }
});

taskList.put("/edit", auth, (req, res) => {
  try {
    const mylist = async () => {
      const user = req.body.location === "/mytasks" ? req.userID : req.body.data.assignto;
      const id = req.body.id;
      await task
        .updateOne(
          {_id: id},
          {
            userID: user,
            task: req.body.data.task,
            task_name: req.body.data.task_name,
            sub_tasks: req.body.data.sub_tasks,
          }
        )
        .then(async () => {
          const updatedTask = await task.findOne({_id: id}).populate("userID", "_id firstName lastName");
          if (!updatedTask) {
            throw new Error();
          } else {
            res.status(200).send(updatedTask);
          }
        });
    };

    mylist();
  } catch (err) {
    console.log(err);
  }
});

taskList.post("/insert", auth, (req, res) => {
  try {
    const addTask = async () => {
      const user = req.body.location === "/mytasks" ? req.userID : req.body.item.assignto;
      const taskName = req.body.item.taskName;
      const discription = req.body.item.discription;
      const subTask = req.body.item.subTask;
      const assignedBy = req.body.location === "/mytasks" ? req.body.item.assignedBy : req.userID;
      const date = new Date();

      if (assignedBy !== "private") {
        const data = await users.findOne({_id: assignedBy});
        const assigneeName = data.firstName + " " + data.lastName;

        const newTask = new task({
          userID: user,
          updated_at: date,
          task: discription,
          task_name: taskName,
          sub_tasks: subTask,
          assignedBy: assignedBy,
          assigneeName: assigneeName,
        });

        await newTask.save().then(async () => {
          let createdTask = await task.findOne({userID: user}).populate("userID", "_id firstName lastName");
          res.send(createdTask);
        });
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

        await newTask.save().then(async () => {
          let createdTask = await task.findOne({userID: user}).populate("userID", "_id firstName lastName");
          res.send(createdTask);
        });
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
