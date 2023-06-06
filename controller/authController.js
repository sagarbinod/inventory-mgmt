const userModel=require('../model/user');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
    console.log("Inside register User");
    console.log(req.body);
    try {
      const user = await userModel.create(req.body);
      res.status(201).json(user);
    } catch (err) {
      res.status(500).json({ message: "Something went wrong", error: err });
    }
  };

  const loginUser = async (req,res) => {
    console.log(req.body)
    try{
        const user = await userModel.findOne({email:req.body.email});
        if(user){
            console.log(user);
            const isValidPassword =await bcrypt.compare(req.body.password,user.password);
            console.log(isValidPassword);
            if(isValidPassword){
                console.log("password is valid");
                const accessToken = jwt.sign(
                    { id: user._id, isAdmin: user.isAdmin },
                    process.env.JWT_SECRET,
                    { expiresIn: "1d" }
                  );
                  const { password, ...rest } = user._doc;
                  res.cookie("jwt", accessToken);
                  res.json({ ...rest, accessToken });
            }else{
                res.status(401).json("Password is incorrect");
            }
        }else{
            res.status(401).json("Email is incorrect");
        }
    }catch(err){
        res.status(500).json({message: "Something went wrong", error: err })
    }
  }


  module.exports = {registerUser, loginUser};