const Problem = require("../models/problems");
const Submissions = require("../models/submissions");
const User = require("../models/user");
const {
  getLangId,
  submitBatch,
  submitToken,
} = require("../utils/problemUtility");
const SolutionVideo = require("../models/solutionVideo");



const createproblem = async(req,res)=>{
    const {
      title,
      description,
      difficulty,
      tags,
      visibleTestCases,
      invisibleTestCases,
      startcode,
      referenceSolution,
      // problemCreator,
    } = req.body;
   

    try{
          //  console.log("BODY:", req.body);

        for(const {language,completeCode} of referenceSolution){
            
            const langId = getLangId(language);

            if (!langId) {
              return res.status(400).send(`Unsupported language: ${language}`);
            }

            const submissions = visibleTestCases.map((testcase) => ({
              source_code: completeCode,
              language_id: langId,
              stdin: testcase.input,
              expected_output: testcase.output,
            }));


                const submitResult = await submitBatch(submissions);
                // console.log(submitResult)

                const resToken = submitResult.map((val) => val.token);
                const testRes = await submitToken(resToken);
                // console.log(testRes);

                for (const test of testRes) {
                if (test.status_id != 3) {
                    return res.status(400).send("Error");
                }
                }
        }

        // console.log("CREATOR:", req.user._id);


       await Problem.create({
        ...req.body,
        problemCreator:req.user._id
       })

        // console.log("Problem Saved Successfully")
       res.status(201).send("Problem Saved Successfully");

    }
    catch(err){
       res.status(400).send("Error: "+err)
    }
}

const updateproblem = async(req,res)=>{
     const {
       title,
       description,
       difficulty,
       tags,
       visibleTestCases,
       invisibleTestCases,
       startcode,
       referenceSolution,
       // problemCreator,
     } = req.body;
     const{id} = req.params;

    try{
         
        if(!id){
          return res.status(400).send("id is not valid")
        }
        
        const dsaProblem = await Problem.findById(id);
        if(!dsaProblem){
          return res.status(404).send("No problem Associated with given id")
        }

        for (const { language, completeCode } of referenceSolution) {
          const langId = getLangId(language);

          if (!langId) {
            return res.status(400).send(`Unsupported language: ${language}`);
          }

          const submissions = visibleTestCases.map((testcase) => ({
            source_code: completeCode,
            language_id: langId,
            stdin: testcase.input,
            expected_output: testcase.output,
          }));

          const submitResult = await submitBatch(submissions);
          // console.log(submitResult);

          const resToken = submitResult.map((val) => val.token);
          const testRes = await submitToken(resToken);
          // console.log(testRes);

          for (const test of testRes) {
            if (test.status_id != 3) {
              return res.status(400).send("Error");
            }
          }
        }

        const newProblem = await Problem.findByIdAndUpdate(id,{...req.body},{runValidators:true},{new:true});
         res.status(200).send("Successfully Updated",newProblem)
    }catch(err){
        res.status(500).send("Error :"+err);
     }
}

const deleteproblem = async(req,res)=>{
   const{id} = req.params;
   try{
      if (!id) {
        return res.status(400).send("id is not valid");
      }

      const deletedProblem = await Problem.findByIdAndDelete(id);
      if(!deletedProblem){
        return res.status(404).send("Problem is Missing");
      }
      res.status(200).send("Succesfully deleted",deletedProblem)
   }catch(err){
        res.status(500).send("Error :" + err);
     
   }
}

const fetchproblem = async(req,res)=>{
   const { id } = req.params;
   try {
     if (!id) {
       return res.status(400).send("id is not valid");
     }
 
     const problem = await Problem.findById(id).select(
       "title description difficulty tags visibleTestCases invisibleTestCases startcode referenceSolution",
     );
       
     if(!problem){
       return res.status(404).send("Problem is Missing")
      }
      const video = await SolutionVideo.findOne({problemId:id})

      if(video){
        const resData = {
          ...problem.toObject(),
          secureUrl: video.secureUrl,
          thumbnailUrl: video.thumbnailUrl,
          duration: video.duration,
        };
        // console.log(resData)
        return res.status(200).send(resData);
      }
     res.status(200).send(problem)
   } catch (err) {
     res.status(500).send("Error :" + err);
   }
}

const fetchallproblem = async (req, res) => {
  try {
    // 1️⃣ Get page and limit from query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // 2️⃣ Calculate skip
    const skip = (page - 1) * limit;

    // 3️⃣ Count total problems
    const totalProblems = await Problem.countDocuments();

    // 4️⃣ Fetch limited problems
    const problems = await Problem.find({})
      .select("title difficulty tags")
      .skip(skip)
      .limit(limit);

    // 5️⃣ Send paginated response
    res.status(200).json({
      problems,
      totalPages: Math.ceil(totalProblems / limit),
      currentPage: page,
    });
  } catch (err) {
    res.status(500).send("Error :" + err.message);
  }
};

const fetchallproblemsolved = async(req,res)=>{
    try{
      const id = req.result._id;
      const user = await User.findById(id).populate({
        path: "problemSolved",
        select:"_id title difficulty tags"
      });
      res.status(200).send(user.problemSolved);
    }catch(err){
      return res.status(500).send("Server Error : "+err);
    }
}

const submittedProblems = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.pid;

    const ans = await Submissions.find({ userId, problemId }).sort({
      createdAt: -1,
    }); // newest first (optional but professional)

    return res.status(200).json(ans);
  } catch (err) {
    return res.status(500).send("Internal server Error");
  }
};

module.exports = {
  createproblem,
  updateproblem,
  deleteproblem,
  fetchproblem,
  fetchallproblem,
  fetchallproblemsolved,
  submittedProblems,
};