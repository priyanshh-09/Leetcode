const mongoose = require('mongoose');
const {Schema} = mongoose;

const videoSchema = new Schema(
  {
    problemId: {
      type: Schema.Types.ObjectId,
      ref: "problem",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    cloudinaryPublicId: {
      type: String,
      required: true,
    },
    secureUrl: {
      type: String,
    },
    thumbnailUrl: {
      type: String,
    },
    duration: {
      type: Number,
    },
  },
  {
    timestamps: true,
  },
);


const SolutionVideo = mongoose.model("solutionVideo", videoSchema);
module.exports= SolutionVideo