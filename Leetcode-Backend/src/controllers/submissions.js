const Problem = require("../models/problems");
const Submissions = require("../models/submissions");
const { getLangId, submitBatch, submitToken } = require("../utils/problemUtility");

const handlesubmit = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.id;
    let { code, language } = req.body;


    if (!userId || !problemId || !code || !language) {
      return res.status(400).send("Some fields are missing");
    }

    if (language === "cpp") {
      language = "c++";
    }

    const problem = await Problem.findById(problemId);
    // console.log("problem found:", !!problem);
    // console.log("invisibleTestCases:", problem?.invisibleTestCases);

    if (!problem) {
      return res.status(404).send("Problem not found");
    }

    if (
      !problem.invisibleTestCases ||
      problem.invisibleTestCases.length === 0
    ) {
      return res.status(400).send("No invisible test cases found");
    }

    const langId = getLangId(language);
    // console.log("langId:", langId);

    if (!langId) {
      return res.status(400).send(`Unsupported language: ${language}`);
    }

    const submissions = problem.invisibleTestCases.map((testcase) => ({
      source_code: code,
      language_id: langId,
      stdin: testcase.input,
      expected_output: testcase.output,
    }));

    // console.log("submissions count:", submissions.length);
    // console.log("first submission:", JSON.stringify(submissions[0], null, 2));

    const submitResult = await submitBatch(submissions);
    // console.log("submitResult:", submitResult);

    if (!submitResult || !Array.isArray(submitResult)) {
      return res.status(500).send("Judge0 response invalid");
    }

    const resToken = submitResult.map((val) => val.token);
    const testRes = await submitToken(resToken);
    console.log("testRes:", testRes);

    let testcasespassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = "Accepted";
    let errorMessage = null;

    for (const test of testRes) {
      if (test.status_id === 3) {
        testcasespassed++;
        runtime += parseFloat(test.time || 0);
        memory = Math.max(memory, test.memory || 0);
      } else if (test.status_id === 6) {
        status = "Compilation Error"; // enum mein hona chahiye
        errorMessage = test.compile_output || test.stderr;
        break;
      } else if (test.status_id === 5) {
        status = "Time Limit Exceeded"; // enum mein hona chahiye
        errorMessage = "Time Limit Exceeded";
      } else if (test.status_id === 4) {
        status = "Wrong Answer"; // enum mein hona chahiye
        errorMessage = test.stderr || null;
      } else {
        status = "Runtime Error"; // enum mein hona chahiye
        errorMessage = test.stderr || test.compile_output || null;
      }
    }

    const submittedResult = await Submissions.create({
      userId,
      problemId,
      code,
      language,
      status,
      totalTestCases: problem.invisibleTestCases.length,
      testCasePassed: testcasespassed,
      errorMessage,
      runtime: runtime.toFixed(3),
      memory,
    });

    if (
      status === "Accepted" &&
      !req.result.problemSolved.includes(problemId)
    ) {
      req.result.problemSolved.push(problemId);
      await req.result.save();
    }

    console.log("=== SUBMIT END ===");

    res.status(201).json({
      accepted: status === "Accepted",
      totalTestCases: problem.invisibleTestCases.length,
      passedTestCases: testcasespassed,
      runtime: runtime.toFixed(3),
      memory,
      status,
      errorMessage,
    });
  } catch (err) {
    // EXACT ERROR PRINT KARO
    console.error("=== SUBMIT ERROR ===");
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    console.error("===================");
    res.status(500).send("Internal server Error : " + err.message);
  }
};

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

       let testcasespassed = 0;
       let runtime = 0;
       let memory = 0;
       let status = "Accepted";
       let errorMessage = null;

       for (const test of testRes) {
         if (test.status_id === 3) {
           testcasespassed++;
           runtime += parseFloat(test.time || 0);
           memory = Math.max(memory, test.memory || 0);
         } else if (test.status_id === 6) {
           status = "Compilation Error"; // enum mein hona chahiye
           errorMessage = test.compile_output || test.stderr;
           break;
         } else if (test.status_id === 5) {
           status = "Time Limit Exceeded"; // enum mein hona chahiye
           errorMessage = "Time Limit Exceeded";
         } else if (test.status_id === 4) {
           status = "Wrong Answer"; // enum mein hona chahiye
           errorMessage = test.stderr || null;
         } else {
           status = "Runtime Error"; // enum mein hona chahiye
           errorMessage = test.stderr || test.compile_output || null;
         }
       }

    res.status(201).json({
      success: status === "Accepted",
      status,
      testCases: testRes,
      runtime,
      memory,
    });

   } catch (err) {
     res.status(500).send("Internal server Error : " + err);
   }
}


module.exports = {
  handlesubmit,
  handleRuncode,
};