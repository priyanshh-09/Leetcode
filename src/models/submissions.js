const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const submissionsSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    problemId: {
      type: Schema.Types.ObjectId,
      ref: "problem",
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
      enum: ["javascript", "c++", "java"],
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Wrong", "Error"],
      default: "Pending",
    },
    runtime: {
      type: Number,
      default: 0,
    },
    memory: {
      type: Number,
      default: 0,
    },
    errorMessage: {
      type: String,
      default: "",
    },
    testCasePassed: {
      type: Number,
      default: 0,
    },
    totalTestCases: {
      type: Number,
      deafult: 0,
    },
  },
  {
    timestamps: true,
  },
);

  
const Submissions = mongoose.model("submissions",submissionsSchema)
module.exports = Submissions;