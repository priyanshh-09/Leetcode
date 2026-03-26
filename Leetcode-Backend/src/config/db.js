const mongoose = require("mongoose")

async function main(){
    return await mongoose.connect(process.env.DB_CONNECT);
    console.log("Succesfully Connected to DB");
    
}

module.exports = main;