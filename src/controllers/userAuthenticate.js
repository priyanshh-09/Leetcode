const redisclient = require("../config/redis")
const Submissions = require("../models/submissions")
const  User = require("../models/user")
const validate = require("../utils/validate")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


const register = async(req,res)=>{
    try{
      //  console.log("RAW BODY 👉", req.body);
      validate(req.body)
      // console.log("✅ Passed custom validation");
      const {firstName, emailId, password } = req.body;
      req.body.password = await bcrypt.hash(password,10);
      req.body.role="user"
      // console.log("👉 Before DB create", req.body);
      const user = await User.create(req.body);

      const token = jwt.sign({_id:user._id,emailId:emailId,role:'user'},process.env.JWT_KEY,{expiresIn:60*60})
      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 60 * 60 * 1000,
      });

      // res.cookie('token',token,{maxAge:60*60*1000});
       const reply = {
         firstName: user.firstName,
         emailId: user.emailId,
         _id: user._id,
       };
      res.status(201).json({
        user:reply,
        message:"Registered Successfully"
      });
    }catch(err){
      // console.error("❌ REGISTER ERROR:", err);
      res.status(400).send("Error: "+err);
    }
}

const login = async(req,res)=>{
  try{
      //  console.log(req.body)
        const{emailId,password}= req.body;
        if(!emailId){
            throw new Error("Invalid Credentials")
        }
        if(!password){
            throw new Error("Invalid Credentials")
        }

       const user = await User.findOne({ emailId });
       if (!user) {
         throw new Error("Invalid Credentials");
       }

       const match = await bcrypt.compare(password, user.password);
       
       if(!match){
        throw new Error("Invalid Credentails");
       }

        const token = jwt.sign(
          { _id: user._id, emailId:emailId, role:user.role},
          process.env.JWT_KEY,
          { expiresIn: 60 * 60 },
        );

        res.cookie("token", token, {
          httpOnly: true,
          maxAge: 60 * 60 * 1000,
        });

        // res.cookie("token", token, { maxAge: 60 * 60 * 1000 });
        const reply = {
          firstName: user.firstName,
          emailId: user.emailId,
          _id: user._id,
        }

        res.status(200).json({
          user:reply,
          message:"Logged In Successfully",
        })
    }
    catch(err){
        res.status(401).send("Error; " + err);
    }
}

const logout = async(req,res)=>{
    try{
        const {token} = req.cookies;
        const payload = jwt.decode(token);

        await redisclient.set(`token:${token}`,'Blocked')
        await redisclient.expireAt(`token:${token}`,payload.exp);

        res.cookie("token",null,{expires: new Date(Date.now())});
        res.send("Logged out Successfully");
    }
    catch(err){
       res.status(503).send("Error: "+err)
    }
}

const adminRegister = async(req,res)=>{
    try {
      validate(req.body);
      const { firstname, emailId, password } = req.body;
      req.body.password = await bcrypt.hash(password, 10);
      req.body.role = "admin";

      const user = await User.create(req.body);

      const token = jwt.sign(
        { _id: user._id, emailId: emailId, role: user.role},
        process.env.JWT_KEY,
        { expiresIn: 60 * 60 },
      );

      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 60 * 60 * 1000,
      });

      // res.cookie("token", token, { maxAge: 60 * 60 * 1000 });

      res.status(201).send("User Register Successfully");
    } catch (err) {
      res.status(400).send("Error: " + err);
    } 
}

const deleteprofile = async(req,res)=>{
  const userId =req.result._id;
  await User.findByIdAndDelete(userId);
  // await Submissions.deleteMany({userId});
  return res.status(200).send("Deleted Succesfully");
}

module.exports = { 
  register, 
  login, 
  logout, 
  adminRegister, 
  deleteprofile 
};