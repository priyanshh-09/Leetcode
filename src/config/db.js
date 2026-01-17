const mongoose = require("mongoose")

async function main(){
    await mongoose.connect(process.env.DB_CONNECT);
    console.log("Succesfully Connected to DB");
    
}

module.exports = main;