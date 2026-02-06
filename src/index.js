require("dotenv").config({ path: "../.env" });
const express = require("express");
const app = express();
// require('dotenv').config()
const main = require("./config/db")
const cookieParser = require("cookie-parser")
const Authrouter = require("./routes/userAuth")
const redisclient = require("./config/redis")
const Problemrouter = require("./routes/problemCreator");
const submissionRouter = require("./routes/submissions");

const cors = require("cors");


app.use(cors({
  origin:'http://localhost:5173',
  credentials:true
}))

app.use(express.json()); // to convert json obj to js obj
app.use(cookieParser());

app.use("/user",Authrouter)
app.use("/problem",Problemrouter);
app.use("/submit",submissionRouter);


const InitializeConnection = async()=>{
  try{
        await Promise.all([main(), redisclient.connect()]);
        console.log("DB Connected");
        app.listen(process.env.PORT,()=>{
        console.log("Server lisining at port no: "+ process.env.PORT);   
    })
  }catch(err){
      console.log("Error: "+err);
    
  }
}

InitializeConnection();
