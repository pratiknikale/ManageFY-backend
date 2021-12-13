const mongoose = require("mongoose");

var users = new mongoose.Schema({
  firstName : String,
  lastName: String,
  email: String,
  password: String,
  
  // ,
  // collection: 'books'
});



module.exports = mongoose.model("users", users);
