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
const aiRouter = require("./routes/aiChat")
const cors = require("cors");
const videoRouter = require("./routes/videoCreator");


// app.use(cors({
//   origin:'http://localhost:5173',
//   credentials:true
// }))

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://leetcode-nine.vercel.app",
      "https://leetcode-nu-olive.vercel.app",
    ],
    credentials: true,
  }),
);

app.use(express.json()); 
app.use(cookieParser());

app.use("/user",Authrouter)
app.use("/problem",Problemrouter);
app.use("/submit",submissionRouter);
app.use("/ai",aiRouter);
app.use("/video",videoRouter);

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
