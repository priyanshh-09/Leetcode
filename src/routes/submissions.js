const express = require("express");
const userMiddleware = require("../middleware/userMiddleware");
const submissionRouter = express.Router();
const {handlesubmit} = require("../controllers/submissions")

submissionRouter.post("/:id",userMiddleware,handlesubmit)
module.exports = submissionRouter;