const express = require("express");
const app = express();
// require('dotenv').config()
require("dotenv").config({ path: "../.env" });
const main = require("./config/db")
const cookieParser = require("cookie-parser")
const Authrouter = require("./routes/userAuth")
const redisclient = require("./config/redis")


app.use(express.json()); // to convert json obj to js obj
app.use(cookieParser());

app.use('/user',Authrouter)


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

// main()
// .then(async ()=>{
//     
// })
// .catch(err=> console.log("Error: "+ err));