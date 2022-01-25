const express = require("express");
const app = express();
const manageManager = express.Router();
let users = require("../models/users");
const auth = require("../middleware/auth");

manageManager.get("/get", auth, (req, res) => {
  // console.log(req.body);
  //   const role = req.headers.role.split(" ")[1];
  // if(role === "manager"){
  try {
    const mylist = async () => {
      const user = req.userID;
      const data = await users.find({role: "manager"});
      res.json(data);
    };

    mylist();
  } catch (err) {
    console.log(err);
  }
  // }else {
  //     res.status(400).json({message: "Not authorised to access this data"});
  // }
});

// manageManager.get('/getId/:id', auth, (req, res) => {
//     try{
//         const mylist = async () => {
//             const user = req.userID;
//             const data = await task.findOne({ userID: user, _id: req.params.id });
//             res.json(data);
//             // console.log(data);
//         }

//         mylist();
//     }catch(err){
//         console.log(err);
//     }

// });

// manageManager.put('/updateStatus', auth, (req, res, next) => {
//     // console.log(req.body)
//     try{
//         const mylist = async () => {
//             const user = req.userID;
//             const id = req.body.id;
//             const status = req.body.status;
//             const stask = req.body.stask;

//                 task.updateOne({ userID: user, _id: id, "sub_tasks.stask": stask},
//                 {

//                     $set: { "sub_tasks.$.status" : status }

//                 },
//                     (error, data) => {
//                     if (error) {
//                         return next(error);
//                     } else {
//                         res.json(data);
//                         console.log("status updated successfully!");
//                     }
//                 });
//         }

//         mylist();
//     }catch(err){
//         console.log(err);
//     }

// });

// manageManager.put('/edit', auth, (req, res, next) => {
//     // console.log(req.body.data)
//     try{
//         const mylist = async () => {
//             const user = req.userID;
//             const id = req.body.id;
//                 task.updateOne({ userID: user, _id: id },
//                     {
//                     "task": req.body.data.task,
//                     "task_name": req.body.data.task_name,
//                     "sub_tasks": req.body.data.sub_tasks,
//                     },
//                     (error, data) => {
//                     if (error) {
//                         return next(error);
//                         console.log(error);
//                     } else {
//                         res.json(data);
//                         console.log("item updated successfully!");
//                     }
//                 });
//         }

//         mylist();
//     }catch(err){
//         console.log(err);
//     }

// });

// manageManager.post('/insert', auth, (req,res) => {
//     // console.log(req.body)
//     try{
//         const addTask = async () => {
//             const user = req.userID;
//             const taskName = req.body.item.taskName;
//             const discription = req.body.item.discription;
//             const subTask = req.body.item.subTask;
//             const date = new Date();
//             const day = date.getDate();
//             const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
//             const month = months[date.getMonth()];
//             const year = date.getFullYear();
//             const hours = date.getHours() ;
//             const min = date.getMinutes() ;
//             const t = date.toLocaleTimeString();
//             const d = date.toLocaleDateString();

//             const newTask = new task({
//                 userID : user,
//                 updated_at : date,
//                 task: discription,
//                 task_name: taskName,
//                 sub_tasks: subTask,

//             });

//             const result = await newTask.save();
//             // console.log(result);
//             res.send(result);

//         }
//         addTask().then(() => {
//             console.log("successfully inserted");
//         });

//     }catch(err){
//         console.log(err);
//     }

// });

// manageManager.delete('/delete/:id', (req,res) => {
//     try{
//         // console.log(req.params.id);
//         const mylist = async () => {
//             const data = await task.findByIdAndRemove(req.params.id);
//             res.json(data);
//             // console.log(data);
//         }

//         mylist();
//     }catch(err){
//         console.log(err);
//     }

//   });

module.exports = manageManager;
