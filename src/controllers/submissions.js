const Problem = require("../models/problems");
const Submissions = require("../models/submissions");
const { getLangId, submitBatch, submitToken } = require("../utils/problemUtility");

const handlesubmit = async(req,res)=>{
   try{
      const userId = req.result._id;
      const problemId  = req.params.id;
      const {code,language} = req.body;

      if (!userId || !problemId || !code || !language) {
        return res.status(400).send("some fields are missing");
      }

      const problem = await Problem.findById(problemId);
      if (!problem) {
        return res.status(404).send("Problem not found");
      }

    //   console.log(problem)
      const submittedResult = await Submissions.create({
        userId,
        problemId,
        code,
        language,
        status: "Pending",
        totalTestCases: problem.invisibleTestCases.length,
      });

            const langId = getLangId(language);
            if (!langId) {
              return res.status(400).send(`Unsupported language: ${language}`);
            }

            const submissions = problem.invisibleTestCases.map((testcase) => ({
              source_code: code,
              language_id: langId,
              stdin: testcase.input,
              expected_output: testcase.output,
            }));
            const submitResult = await submitBatch(submissions);
            const resToken = submitResult.map((val) => val.token);
            const testRes = await submitToken(resToken);

             let testcasespassed=0;
             let runtime=0;
             let memory=0;
             let status = "Accepted";
             let errorMessage=null;

            for(const test of testRes){
                if(test.status_id == 3){
                  testcasespassed++;
                  runtime = runtime + parseFloat(test.time);
                  memory = Math.max(memory,test.memory);
                }else{
                   if(test.status_id == 4){
                    status = "Error"
                    errorMessage=test.stderr
                   }
                   else{
                    status="Wrong"
                    errorMessage= test.stderr;
                   }
                }
            }
            
            submittedResult.status = status;
            submittedResult.testCasePassed = testcasespassed;
            submittedResult.errorMessage = errorMessage;
            submittedResult.runtime = runtime;
            submittedResult.memory = memory;

            await submittedResult.save();

             res.status(201).send("Submitted",submittedResult);

            if(!req.result.problemSolved.includes(problemId)){
                req.result.problemSolved.push(problemId)
                await req.result.save();
            }
  
   }
   catch(err){
     res.status(500).send("Internal server Error : "+err);
   }
}

const handleRuncode = async(req,res)=>{
   try {
     const userId = req.result._id;
     const problemId = req.params.id;
     const { code, language } = req.body;

     if (!userId || !problemId || !code || !language) {
       return res.status(400).send("some fields are missing");
     }

     const problem = await Problem.findById(problemId);
     if (!problem) {
       return res.status(404).send("Problem not found");
     }

     const langId = getLangId(language);
     if (!langId) {
       return res.status(400).send(`Unsupported language: ${language}`);
     }

     const submissions = problem.visibleTestCases.map((testcase) => ({
       source_code: code,
       language_id: langId,
       stdin: testcase.input,
       expected_output: testcase.output,
     }));
     const submitResult = await submitBatch(submissions);
     const resToken = submitResult.map((val) => val.token);
     const testRes = await submitToken(resToken);

     res.status(201).send(testRes);

   } catch (err) {
     res.status(500).send("Internal server Error : " + err);
   }
}


module.exports = {
  handlesubmit,
  handleRuncode,
};