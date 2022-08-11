const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userAuth = express.Router();
let users = require("../models/users");
const auth = require("../middleware/auth");

userAuth.post("/signup", async (req, res) => {
  try {
    const email = req.body.Email;
    const password = req.body.Password;
    const role = req.body.Role;
    const existUser = await users.findOne({email});
    console.log(role);
    if (existUser) return res.status(400).json({message: "email already exists"});

    const hashedPassword = await bcrypt.hash(password, 12);

    const saveUser = async () => {
      const newUser = new users({
        firstName: req.body.FirstName,
        lastName: req.body.LastName,
        email: email,
        password: hashedPassword,
        role: role,
      });

      const result = await newUser.save();
      const token = jwt.sign({email: result.email, id: result._id}, "test", {expiresIn: "1d"});
      res.status(200).json({result, token});
    };

    saveUser();
  } catch (err) {
    console.log(err);
  }
});

userAuth.post("/signin", async (req, res) => {
  try {
    const email = req.body.Email;
    const password = req.body.Password;
    const result = await users.findOne({email});
    console.log(result.role);

    if (!result) return res.status(404).json({message: "no user found"});

    const isPasswordCorrect = await bcrypt.compare(password, result.password);

    if (!isPasswordCorrect) return res.status(400).json({message: "Invalid password"});

    if (result.role === "manager") {
      //   if (result.role === "employee")
      //     res.status(400).json({message: "You have entered Employee Credentials. Please signin through employee signin"});

      const token = jwt.sign({email: email, id: result._id}, "test-manager", {expiresIn: "1d"});
      res.status(200).json({result, token});
    } else if (result.role === "employee") {
      //   if (result.role === "manager")
      //     res.status(400).json({message: "You have entered Manager Credentials. Please signin through manager signin"});

      const token = jwt.sign({email: email, id: result._id}, "test", {expiresIn: "1d"});
      res.status(200).json({result, token});
    }
  } catch (err) {
    res.status(500).json({message: "something went wrong"});
    console.log(err);
  }
});

//for new manager
userAuth.post("/managersignup", auth, async (req, res) => {
  try {
    const email = req.body.Email;
    const password = req.body.Password;
    const existUser = await users.findOne({email});
    const role = req.headers.role.split(" ")[1];

    if (existUser) return res.status(400).json({message: "email already exists"});

    const hashedPassword = await bcrypt.hash(password, 12);

    if (role === "manager") {
      const saveUser = async () => {
        const newUser = new users({
          firstName: req.body.FirstName,
          lastName: req.body.LastName,
          email: email,
          password: hashedPassword,
          role: role,
        });

        const result = await newUser.save();
        // console.log(result);
        // res.send(result);
        const token = jwt.sign({email: result.email, id: result._id}, "test-manager", {expiresIn: "1d"});
        res.status(200).json({result, token});
      };

      saveUser();
    } else {
      res.status(400).json({message: "Invalid User Role you need to be a manager to create new manager"});
    }
  } catch (err) {
    console.log(err);
  }
});

module.exports = userAuth;
