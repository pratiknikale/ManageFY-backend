const mongoose = require("mongoose");

var task = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  updated_at: String,
  task: String,
  task_name: String,
  sub_tasks: Array,
  assignedBy: String,
  assigneeName: String,
  status: {type: String, default: "pending"},

  // ,
  // collection: 'books'
});

module.exports = mongoose.model("task", task);
