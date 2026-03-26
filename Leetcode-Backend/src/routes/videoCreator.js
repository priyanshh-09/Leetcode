const express = require('express');
const adminMiddleware = require('../middleware/adminMiddleware');
const videoRouter = express.Router();
const {generateuploadsSignature, saveVideoMetadata, deleteVideo} = require("../controllers/videoSection");


videoRouter.get("/create/:problemId", adminMiddleware, generateuploadsSignature);
videoRouter.post("/save", adminMiddleware, saveVideoMetadata);
videoRouter.delete("/delete/:problemId", adminMiddleware, deleteVideo);


module.exports = videoRouter;
