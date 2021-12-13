const mongoose = require("mongoose");

var task = new mongoose.Schema({
  userID : String,
  updated_at : String,
  task: String,
  task_name: String,
  sub_tasks: Array,
  
  // ,
  // collection: 'books'
});



module.exports = mongoose.model("task", task);
