const express = require("express");
const userMiddleware = require("../middleware/userMiddleware");
const submissionRouter = express.Router();
const { handlesubmit, handleRuncode } = require("../controllers/submissions");

submissionRouter.post("/:id",userMiddleware,handlesubmit);
submissionRouter.post("/run/:id",userMiddleware, handleRuncode);


module.exports = submissionRouter;