const express = require("express");
const app = express();
// require('dotenv').config()
require("dotenv").config({ path: "../.env" });
const main = require("./config/db")
const cookieParser = require("cookie-parser")

app.use(express()); // to convert json obj to js obj
app.use(cookieParser());

main()
.then(async ()=>{
    app.listen(process.env.PORT,()=>{
        console.log("Server lisining at port no: "+ process.env.PORT);   
    })
})
.catch(err=> console.log("Error: "+ err));