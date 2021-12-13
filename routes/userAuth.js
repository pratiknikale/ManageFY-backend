const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userAuth = express.Router();
let users = require("../models/users");




userAuth.post('/signup', async (req, res) => {
    console.log("signup")
    // console.log(req.body)
    try{
        const email = req.body.Email;
        const password = req.body.Password;
        const existUser = await users.findOne({ email })

        if(existUser) return res.status(400).json({message: "email already exists"});

        const hashedPassword = await bcrypt.hash(password, 12);
        
        const saveUser = async() => {
            const newUser = new users({
                firstName : req.body.FirstName,
                lastName: req.body.LastName,
                email: email,
                password: hashedPassword,
    
            })
    
            const result = await newUser.save();
                // console.log(result);
                // res.send(result);    
            const token = jwt.sign({email: result.email, id: result._id}, 'test', {expiresIn: "24hr"});
            res.status(200).json({result, token});
        }

        saveUser();

    }catch(err){
        console.log(err);
    }
    
});



userAuth.post('/signin', async (req, res) => {
    // console.log("signin")
    // console.log(req.body)
    try{
        const email = req.body.Email;
        const password = req.body.Password;
        const result = await users.findOne({ email })

        if(!result) return res.status(404).json({message: "no user found"});

        const isPasswordCorrect = await bcrypt.compare(password, result.password);

        if(!isPasswordCorrect) return res.status(400).json({message: "Invalid password"});

        const token = jwt.sign({email: email, id: result._id}, 'test', {expiresIn: "24hr"});

        res.status(200).json({result, token});


    }catch(err){
        res.status(500).json({message: "something went wrong"});
        console.log(err);
    }
    
});


module.exports = userAuth;
