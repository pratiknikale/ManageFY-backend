const mongoose = require("mongoose");

var task = new mongoose.Schema({
  userID: String,
  updated_at: String,
  task: String,
  task_name: String,
  sub_tasks: Array,
  assignedBy: String,
  assigneeName: String,

  // ,
  // collection: 'books'
});

module.exports = mongoose.model("task", task);
