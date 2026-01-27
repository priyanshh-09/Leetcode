const express = require("express");
const Problemrouter = express.Router();
const adminMiddleware = require("../middleware/adminMiddleware");
const createproblem = require("../controllers/userProblems");
const userMiddleware = require("../middleware/userMiddleware");
const updateproblem = require("../controllers/userProblems");
const deleteproblem = require("../controllers/userProblems");
const fetchproblem = require("../controllers/userProblems");
const fetchallproblem = require("../controllers/userProblems");
const fetchallproblemsolved = require("../controllers/userProblems");







Problemrouter.post('/create',adminMiddleware,createproblem);
Problemrouter.patch("/update/:id", adminMiddleware,updateproblem);
Problemrouter.delete("/delete/:id", adminMiddleware, deleteproblem);

Problemrouter.get('/get/:id',userMiddleware, fetchproblem); 
Problemrouter.get('/getall',userMiddleware,fetchallproblem);
Problemrouter.get("/allproblems",userMiddleware,fetchallproblemsolved);


module.exports = Problemrouter;
