const express = require("express");
const Problemrouter = express.Router();
const adminMiddleware = require("../middleware/adminMiddleware");
const createproblem = require("../controllers/userProblems");


Problemrouter.post('/create',adminMiddleware,createproblem);
// Problemrouter.get('/:id',fetchproblem);
// Problemrouter.get('/',fetchallproblem);
// Problemrouter.patch('/:id',updateproblem);
// Problemrouter.delete("/:id", deleteproblem);
// Problemrouter.get("/user",fetchallproblemsolved);


module.exports = Problemrouter;;
