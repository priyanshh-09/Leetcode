const Problem = require("../models/problems");
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
                console.log(testRes);

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

module.exports = createproblem;