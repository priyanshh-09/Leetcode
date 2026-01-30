const Problem = require("../models/problems");
const User = require("../models/user");
const {
  getLangId,
  submitBatch,
  submitToken,
} = require("../utils/problemUtility");


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
                console.log(submitResult)

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
       "title description difficulty tags visibleTestCases startcode referenceSolution",
     );
     if(!problem){
      res.status(404).send("Problem is Missing")
     }
     res.status(200).send(problem)
   } catch (err) {
     res.status(500).send("Error :" + err);
   }
}

const fetchallproblem = async (req, res)=>{
  try {
    const problems = await Problem.find({}).select(
      "title difficulty tags ",
    );
    if (problems.length===0) {
      res.status(404).send("Problems are Missing");
    }
    res.status(200).send(problems);
  } catch (err) {
    res.status(500).send("Error :" + err);
  }
}

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

module.exports = {
  createproblem,
  updateproblem,
  deleteproblem,
  fetchproblem,
  fetchallproblem,
  fetchallproblemsolved,
};