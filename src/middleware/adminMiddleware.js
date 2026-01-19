const jwt = require('jsonwebtoken')
const redisclient = require("../config/redis");
const User = require('../models/user');

const adminMiddleware = async (req,res,next)=>{
    try{

        const {token} = req.cookies;
        if(!token){
            throw new Error("No Token");
        }

        const payload = jwt.verify(token,process.env.JWT_KEY);
        const {_id} = payload;
        if(!_id){
            throw new Error("invalid Token");
        }
        const res = await User.findById(_id);
        
        if(payload.role != admin){
            throw new Error("invalid Token");
        }

        if(!res){
            throw new Error("User Does not Exit");
        }


        const IsBlocked = await redisclient.exists(`token:${token}`);

        if(IsBlocked){
            throw new Error("Invalid Token");
        }

        req.res = res;

        next();
    }catch(err){
        res.status(401).send("Error: "+err.message);
    }
}

module.exports = adminMiddleware;


