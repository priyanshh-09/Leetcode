const express = require("express");
const Problemrouter = express.Router();

const adminMiddleware = require("../middleware/adminMiddleware");
const userMiddleware = require("../middleware/userMiddleware");
const submitRateLimiter = require("../middleware/ratelimiter")

const {
  createproblem,
  updateproblem,
  deleteproblem,
  fetchproblem,
  fetchallproblem,
  fetchallproblemsolved,
  submittedProblems,
} = require("../controllers/userProblems");




Problemrouter.post('/create',adminMiddleware,createproblem);
Problemrouter.put("/update/:id", adminMiddleware,updateproblem);
Problemrouter.delete("/delete/:id", adminMiddleware, deleteproblem);

Problemrouter.get('/get/:id',userMiddleware, fetchproblem); 
Problemrouter.get('/getall',userMiddleware,fetchallproblem);
Problemrouter.get("/allproblems",userMiddleware,fetchallproblemsolved);
Problemrouter.get(
  "/submittedProblems/:pid",
  userMiddleware,
  submitRateLimiter,
  submittedProblems,
);



module.exports = Problemrouter;
