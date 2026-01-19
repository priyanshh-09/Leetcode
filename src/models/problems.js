const  mongoose  = require("mongoose");
const {Schema} = mongoose;

const problemsSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    diffuculty: {
        type: String,
        enum: ["Easy", "Medium", "Hard"],
    },
    tags: {
        type: String,
        enum: ["array", "linkedlIst", "graph", "Dp"],
        required: true,
    },
    visibleTestCases: [
        {
        input: {
            type: String,
            required: true,
        },
        output: {
            type: String,
            required: true,
        },
        explanation: {
            type: String,
            required: true,
        },
        },
    ],
    invisibleTestCases: [
        {
        input: {
            type: String,
            required: true,
        },
        output: {
            type: String,
            required: true,
        },
        },
    ],
    startcode: [
        {
        language: {
            type: String,
            required: true,
        },
        initialcode: {
            type: String,
            required: true,
        },
        },
    ],
    problemCreator:{
        type:Schema.Types.ObjectId,
        ref:'user',
        required:true
    }
});

const Problem = mongoose.model('problem',problemsSchema);
module.exports = Problem