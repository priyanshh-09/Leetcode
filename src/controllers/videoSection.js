
const cloudinary = require("cloudinary").v2;
const Problem = require("../models/problems");
const User = require("../models/user");
const SolutionVideo = require("../models/solutionVideo");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const generateuploadsSignature= async(req,res)=>{
    try{
        const{problemId} = req.params;
        const userId =req.user._id;
        
        const problem = await Problem.findById(problemId);

        if(!problem){
            return res.status(404).json({error:'problem not found'});
        }

        const timestamp = Math.round(new Date().getTime()/1000);
        const publicId = `leetcode-solutions/${problemId}/${userId}_${timestamp}`;

        const uploadParams = {
            timestamp:timestamp,
            public_id:publicId, 
        };

        const signature= cloudinary.utils.api_sign_request(
            uploadParams,
            process.env.CLOUDINARY_API_SECRET
        );

        res.json({
            signature,
            timestamp,
            public_id:publicId,
            api_key:process.env.CLOUDINARY_API_KEY,
            cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
            upload_url:`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload`
        })

    }catch(err){
       console.error('Error generating upload signature:', err);
       res.status(500).json({error:'Failed to generate upload credentails'})
    }
};

const saveVideoMetadata = async(req,res)=>{
    try{

        const{
            problemId,
            cloudinaryPublicId,
            secureUrl,
            duration
        } = req.body;

        const userId = req.user._id;

        const cloudinaryResource = await cloudinary.api.resource(
            cloudinaryPublicId,
            {resource_type:'video'}
        )

        if(!cloudinaryResource){
            return res.status(400).json({error:'Video not found on Cloudinary'})
        }

       const existingVideo = await SolutionVideo.findOne({
            problemId,
            userId,
       });

        if (existingVideo) {
        return res.status(400).json({
            error: "Video already exists for this problem"
        });
        }

        const thumbnailUrl = cloudinary.image(cloudinaryResource.public_id,{resource_type:"video"});

        const videoSolution = new SolutionVideo({
          problemId,
          userId,
          cloudinaryPublicId,
          secureUrl,
          duration:cloudinaryResource.duration || duration,
          thumbnailUrl
        });

        // await SolutionVideo.save();
        await videoSolution.save();

        res.status(201).json({
          message: "Video solution saved succesfully",
          videoSolution: {
           id: videoSolution._id,
            thumbnailUrl: videoSolution.thumbnailUrl,
            duration: videoSolution.duration,
            uploadedAt: videoSolution.createdAt
          }
        });
    }catch(err){
       console.error("Error saving video metadata:", err);
       res.status(500).json({ error: "Failed to save video metadata" });
    }
}; 

const deleteVideo = async (req, res) => {
  try {
    const {problemId} = req.params;
    // console.log("Deleting problemId:", problemId);
    // const userId = req.user._id;
    const userId = req.user._id;

    const video = await SolutionVideo.findOneAndDelete({problemId});

    if(!video){
     return res.status(404).json({ error: "Video not found" });
    }

    await cloudinary.uploader.destroy(video.cloudinaryPublicId, {
    resource_type: "video",
    invalidate: true,
   });

    res.json({message:'video deleted sucessfully'})
  } catch (err) {
    console.error("Error deleting video:", err);
    res.status(500).json({ error: "Failed to delete video" });
  }
}; 

module.exports = {
  generateuploadsSignature,
  saveVideoMetadata,
  deleteVideo,
};