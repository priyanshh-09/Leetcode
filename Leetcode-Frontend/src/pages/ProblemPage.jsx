import { useParams } from "react-router";
import { useEffect, useState, useRef, useMemo } from "react";
import axiosClient from "../utils/axiosClient";
import Editor from "@monaco-editor/react";
import ChatAi from "../Components/ChatAi";
import Editorials from "../Components/Editorials";

export default function ProblemPage() {
  const { id } = useParams();

  const [problem, setProblem] = useState(null);
  const [loadingProblem, setLoadingProblem] = useState(true);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult,setSubmitResult] = useState(null);
  const [runResult, setRunResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState("Description");
  const [activeRightTab, setActiveRightTab] = useState("Code");
  const [selectedLanguage, setSelectedLanguage] = useState("cpp");


  const [submissions, setSubmissions] = useState([]);
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  //resizer code 
  const [leftWidth, setLeftWidth] = useState(50);
  const isResizing = useRef(false);

  const handleMouseDown = () => {
    isResizing.current = true;
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing.current) return;
      const container = document.getElementById("panel-container");
      const containerRect = container.getBoundingClientRect();
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      if (newLeftWidth > 20 && newLeftWidth < 80) {
        setLeftWidth(newLeftWidth);
      }
    };

    const handleMouseUp = () => {
      isResizing.current = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);




  // Store code separately for each language
  const [codeByLang, setCodeByLang] = useState({});
  const editorRef = useRef(null);
  /* ================= FETCH PROBLEM ================= */

  useEffect(() => {
    let ignore =false;
    const fetchProblem = async () => {
      try {
        // setLoading(true);
        setLoadingProblem(true)
        const { data } = await axiosClient.get(
          `/problem/get/${id}`,
        );
        //  console.log(data);
          setProblem(data);
          // setCode(initialCode);
          // setLoadingProblem(false);
      } catch (err) {
        console.error("Error fetching problem:", err);
      } finally {
        if (!ignore) {
          // setLoading(false);
          setLoadingProblem(false)
        }
      }
    };

    fetchProblem();

    return () => {
      ignore = true;
    };
  }, [id]);
 
 useEffect(() => {
   if (activeLeftTab === "Submission" && problem?._id) {
     fetchSubmissions();
   }
 }, [activeLeftTab, problem, page]);


  const fetchSubmissions = async () => {
    try {
      setSubmissionLoading(true);
      setSubmissionError(null);

      const { data } = await axiosClient.get(
        `/problem/submittedProblems/${id}?page=${page}&limit=10`,
      );
          // console.log(data)
      setSubmissions(data);
    } catch (err) {
      setSubmissionError("Failed to fetch submissions");
      console.error(err);
    } finally {
      setSubmissionLoading(false);
    }
  };

  /* ================= GET STARTER CODE ================= */
 

  const normalizeLanguage = (lang) => {
    if (!lang) return "";

    const lower = lang.toLowerCase();

    if (lower === "c++" || lower === "cpp") return "cpp";
    if (lower === "javascript" || lower === "js") return "javascript";
    if (lower === "java") return "java";

    return lower;
  };

 const getStarterCode = (language) => {
   if (!problem?.startcode) return "// Write your code here";

   const normalizedSelected = normalizeLanguage(language);

   const matched = problem.startcode.find((sc) => {
     const normalizedDbLang = normalizeLanguage(sc.language);
     return normalizedDbLang === normalizedSelected;
   });

   return (
     matched?.initialcode ?? matched?.initialCode ?? "// Write your code here"
   );
 };

  

  /* ================= LOAD INITIAL CODE ================= */

  useEffect(() => {
    if (!problem) return;

    // If this language doesn't already have code, load starter
    if (!codeByLang[selectedLanguage]) {
      const starter = getStarterCode(selectedLanguage);

      setCodeByLang((prev) => ({
        ...prev,
        [selectedLanguage]: starter,
      }));
    }
  }, [problem, selectedLanguage]);

  /* ================= CHANGE LANGUAGE ================= */

  const changeLanguage = (lang) => {
    setSelectedLanguage(lang);
  };

  /* ================= HANDLE EDITOR CHANGE ================= */

  const handleCodeChange = (value) => {
    setCodeByLang((prev) => ({
      ...prev,
      [selectedLanguage]: value,
    }));
  };

  /* ================= LEFT TAB CONTENT ================= */

  const renderLeftContent = () => {
    switch (activeLeftTab) {
      case "Description":
        return (
          <div
            className="space-y-6"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            <div>
              <p
                className="text-sm leading-7 tracking-wide text-base-content/80 whitespace-pre-line"
                style={{ fontFamily: "'Inter', sans-serif", lineHeight: "1.8" }}
              >
                {problem.description}
              </p>
            </div>

            {problem.visibleTestCases?.length > 0 && (
              <div>
                <h2 className="font-semibold text-lg mb-3 tracking-tight">
                  Examples
                </h2>

                <div className="space-y-4">
                  {problem.visibleTestCases.map((tc, index) => (
                    <div
                      key={index}
                      className="border rounded-xl p-4 bg-base-200"
                    >
                      <h3 className="font-semibold mb-3 text-sm text-base-content/60 uppercase tracking-widest">
                        Example {index + 1}
                      </h3>

                      <div className="text-sm space-y-2">
                        <div className="flex gap-2">
                          <span className="font-semibold min-w-[80px]">
                            Input:
                          </span>
                          <code className="bg-base-300 px-2 py-0.5 rounded text-sm font-mono">
                            {tc.input}
                          </code>
                        </div>

                        <div className="flex gap-2">
                          <span className="font-semibold min-w-[80px]">
                            Output:
                          </span>
                          <code className="bg-base-300 px-2 py-0.5 rounded text-sm font-mono">
                            {tc.output}
                          </code>
                        </div>

                        {tc.explanation && (
                          <div className="flex gap-2 mt-2 pt-2 border-t border-base-300">
                            <span className="font-semibold min-w-[80px]">
                              Explanation:
                            </span>
                            <span className="text-base-content/70 leading-relaxed">
                              {tc.explanation}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case "Editorial":
        return (
          <div>
            <Editorials
              duration={problem.duration}
              secureUrl={problem.secureUrl}
              thumbnailUrl={problem.thumbnailUrl}
            />
          </div>
        );

      case "Solutions":
        if (!problem?.referenceSolution?.length) {
          return <p>No solutions available.</p>;
        }

        return (
          <div className="space-y-6">
            {Array.isArray(problem.referenceSolution) &&
              problem.referenceSolution.map((sol, index) => (
                <div key={index} className="border rounded-xl p-4 bg-base-200">
                  <h3 className="font-bold mb-2">{sol.language} Solution</h3>

                  <Editor
                    height="300px"
                    language={
                      (sol.language || "").toLowerCase() === "c++"
                        ? "cpp"
                        : (sol.language || "").toLowerCase()
                    }
                    value={(sol.completeCode || "").replace(/\\n/g, "\n")}
                    theme="vs-dark"
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      fontSize: 14,
                      automaticLayout: true,
                    }}
                  />
                </div>
              ))}
          </div>
        );

      case "Submission":
        if (submissionLoading) {
          return <p className="mt-6">Loading submissions...</p>;
        }

        if (submissionError) {
          return <p className="text-red-500 mt-6">{submissionError}</p>;
        }

        if (submissions.length === 0) {
          return <p className="mt-6">No submissions yet.</p>;
        }

        return (
          <div className="mt-6">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Runtime</th>
                  <th>Memory</th>
                  <th>Test Cases</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {submissions.map((sub) => (
                  <tr key={sub._id}>
                    <td>
                      <span
                        className={`badge ${
                          sub.status === "Accepted"
                            ? "badge-success"
                            : "badge-error"
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>

                    <td>{sub.runtime} ms</td>
                    <td>{sub.memory} KB</td>
                    <td>
                      {sub.testCasePassed ?? sub.testCasesPassed ?? 0} /{" "}
                      {sub.totalTestCases ?? 0}
                    </td>

                    <td>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => {
                          // console.log(sub);
                          setSelectedSubmission(sub);
                        }}
                      >
                        Code
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* PAGINATION */}
            <div className="flex justify-center gap-4 mt-6">
              <button
                className="btn btn-sm"
                disabled={page === 1}
                onClick={() => setPage((prev) => prev - 1)}
              >
                Previous
              </button>

              <span className="font-semibold">
                Page {page} of {totalPages}
              </span>

              <button
                className="btn btn-sm"
                disabled={page === totalPages}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
              </button>
            </div>
            {/* Code Modal */}
            {selectedSubmission && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                <div className="bg-white p-6 w-3/4 max-h-[80vh] overflow-auto rounded-lg">
                  <h3 className="text-xl font-bold mb-4">
                    Submitted Code ({selectedSubmission.language})
                  </h3>

                  <Editor
                    height="60vh"
                    language={
                      selectedSubmission.language === "c++"
                        ? "cpp"
                        : selectedSubmission.language
                    }
                    value={selectedSubmission.code}
                    theme="vs-dark"
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      fontSize: 14,
                      automaticLayout: true,
                    }}
                  />

                  <div className="text-right mt-4">
                    <button
                      className="btn btn-sm"
                      onClick={() => setSelectedSubmission(null)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case "Pie-AskMe":
        return (
          <div className="prose max-w-none">
            <h2 className="text-xl font-bold mb-4">Chat With Pie</h2>
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              <ChatAi problem={problem} />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  /* ================= RIGHT TAB CONTENT ================= */

 const renderRightContent = () => {
   switch (activeRightTab) {
     case "Code":
       return (
         <Editor
           height="70vh"
           language={selectedLanguage}
           value={codeByLang[selectedLanguage] || ""}
           onMount={(editor) => (editorRef.current = editor)}
           onChange={handleCodeChange}
           theme="vs-dark"
           options={{
             fontSize: 14,
             minimap: { enabled: false },
             automaticLayout: true,
             lineHeight: 24,        // ✅ more space between lines
             padding: { top: 0 }, // ✅ breathing room at top
             letterSpacing: 0.5,   // ✅ slight letter spacing
           }}
         />
       );

     case "Testcase":
       return (
         <div className="flex-1 p-4 overflow-y-auto">
           <h1 className="font-semibold mb-4">Test Result</h1>

           {!runResult && (
             <p className="text-gray-500">
               Click "Run" to see testcase results.
             </p>
           )}

           {runResult && (
             <div
               className={`alert ${
                 runResult.success ? "alert-success" : "alert-error"
               } mb-4`}
             >
               <div className="w-full">
                 {/* SUCCESS CASE */}
                 {runResult.success ? (
                   <>
                     <h4 className="font-bold text-lg">
                       All testcases passed 🎉 ({runResult.testCases?.length}/
                       {runResult.testCases?.length})
                     </h4>

                     <p className="font-bold text-sm mt-2">
                       Runtime: {runResult.runtime} sec
                     </p>

                     <p className="font-bold text-sm">
                       Memory: {runResult.memory} KB
                     </p>

                     <div className="mt-4 space-y-2">
                       {runResult.testCases?.map((tc, i) => (
                         <div
                           key={i}
                           className="bg-base-100 p-3 rounded text-xs border"
                         >
                           <div className="font-mono space-y-1">
                             <div className="font-bold text-green-600 ">
                               <strong>Input:</strong> {tc.stdin}
                             </div>

                             <div className="font-bold text-green-600 ">
                               <strong>Output:</strong> {tc.stdout}
                             </div>

                             <div className="text-green-600 font-bold">
                               Passed
                             </div>
                           </div>
                         </div>
                       ))}
                     </div>
                   </>
                 ) : (
                   <>
                     <h4 className="font-bold text-lg">
                       Some testcases failed ❌
                     </h4>
                     {runResult.status && (
                       <p className="text-xl font-bold text-red-700 mt-2">
                         Status: {runResult.status}
                       </p>
                     )}

                     <div className="mt-4 space-y-2">
                       {runResult.testCases?.map((tc, i) => (
                         <div
                           key={i}
                           className="bg-base-100 p-3 rounded text-xs border"
                         >
                           <div className="font-mono space-y-1 font-bold text-red-700 text-sm">
                             <div >
                               <strong>Input:</strong> {tc.stdin}
                             </div>

                             <div >
                               <strong>Expected:</strong> {tc.expected_output}
                             </div>

                             <div >
                               <strong>Your Output:</strong> {tc.stdout}
                             </div>

                             <div
                               className={
                                 tc.status_id === 3
                                   ? "text-green-700 text-sm"
                                   : "text-red-700 text-sm"
                               }
                             >
                               {tc.status_id === 3 ? "Passed" : "Failed"}
                             </div>
                           </div>
                         </div>
                       ))}
                     </div>
                   </>
                 )}
               </div>
             </div>
           )}
         </div>
       );

     case "Result":
       return (
         <div className="p-4 space-y-4">
           {/* RUN RESULT CARD */}
           {runResult && (
             <div className="bg-base-100 p-4 rounded-xl border shadow-sm">
               <h2 className="font-bold text-lg mb-3">Run Result</h2>

               <div
                 className={`badge ${
                   runResult.success ? "badge-success" : "badge-error"
                 }`}
               >
                 {runResult.status}
               </div>

               <div className="mt-3 text-sm space-y-1">
                 <p>
                   <strong>Runtime:</strong> {runResult.runtime} sec
                 </p>
                 <p>
                   <strong>Memory:</strong> {runResult.memory} KB
                 </p>
                 <p>
                   <strong>Testcases Passed:</strong>{" "}
                   {
                     runResult.testCases?.filter((t) => t.status_id === 3)
                       .length
                   }
                   /{runResult.testCases?.length}
                 </p>
               </div>
             </div>
           )}

           {/* SUBMIT RESULT CARD */}
           {submitResult && (
             <div className="bg-base-100 p-4 rounded-xl border shadow-sm">
               <h2 className="font-bold text-lg mb-3">Submission Result</h2>

               <div
                 className={`badge ${
                   submitResult.accepted ? "badge-success" : "badge-error"
                 }`}
               >
                 {submitResult.accepted ? "Accepted" : "Rejected"}
               </div>

               <div className="mt-3 text-sm space-y-1">
                 <p>
                   <strong>Passed:</strong> {submitResult.passedTestCases} /{" "}
                   {submitResult.totalTestCases}
                 </p>

                 <p>
                   <strong>Runtime:</strong> {submitResult.runtime} sec
                 </p>

                 <p>
                   <strong>Memory:</strong> {submitResult.memory} KB
                 </p>
               </div>
             </div>
           )}

           {!runResult && !submitResult && (
             <p className="text-gray-500">No result yet.</p>
           )}
         </div>
       );

     default:
       return null;
   }
 };

  /* ================= LOADING ================= */

  if (!problem) {
    console.log("FULL PROBLEM:", problem);
    return <div className="p-6 text-xl">Fetching Data...</div>;
  }
  
  
  const handleRunCode = async () => {
    setRunning(true);
    setRunResult(null);

    try {
      const response = await axiosClient.post(`/submit/run/${id}`, {
        code: codeByLang[selectedLanguage],
        language: selectedLanguage,
      });

      setRunResult(response.data);
      setActiveRightTab("Testcase");
    } catch (err) {
      console.error(err);
      setRunResult({
        success: false,
        error: "Run failed",
      });
    } finally {
      setRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    setSubmitting(true);
    setSubmitResult(null);

    try {
      const response = await axiosClient.post(`/submit/${id}`, {
        code: codeByLang[selectedLanguage],
        language: selectedLanguage,
      });

      setSubmitResult(response.data);
      setActiveRightTab("Result");
      if (activeLeftTab === "Submission") {
  fetchSubmissions();
}
    } catch (err) {
      console.error(err);
      setSubmitResult({
        accepted: false,
        error: "Submission failed",
      });
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* HEADER */}
      <div className="flex justify-between items-center bg-base-200 px-6 py-3 border-b sticky top-0 z-50 shrink-0">
        <div className="flex gap-10">
          {[
            "Description",
            "Editorial",
            "Solutions",
            "Submission",
            "Pie-AskMe",
          ].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveLeftTab(tab)}
              className={`btn btn-sm ${activeLeftTab === tab ? "btn-primary" : "btn-ghost"} font-bold`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex gap-10">
          {["Code", "Testcase", "Result"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveRightTab(tab)}
              className={`btn btn-sm ${activeRightTab === tab ? "btn-secondary" : "btn-ghost"} font-bold`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* BODY */}
      <div id="panel-container" className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL */}
        <div
          style={{ width: `${leftWidth}%` }}
          className="flex-shrink-0 p-6 overflow-y-auto border-r bg-base-100 h-full"
        >
          {activeLeftTab === "Description" && (
            <>
              <h1 className="text-3xl font-bold mb-5">{problem.title}</h1>
              <div className="mb-4 flex gap-2 flex-wrap">
                <span
                  className={`badge ${
                    problem.difficulty === "Easy"
                      ? "badge-success"
                      : problem.difficulty === "Medium"
                        ? "badge-warning"
                        : "badge-error"
                  } font-bold`}
                >
                  {problem.difficulty}
                </span>
                {Array.isArray(problem.tags) ? (
                  problem.tags.map((tag) => (
                    <span key={tag} className="badge badge-outline font-bold">
                      {tag}
                    </span>
                  ))
                ) : problem.tags ? (
                  <span className="badge badge-outline badge-warning font-bold">
                    {problem.tags}
                  </span>
                ) : null}
              </div>
            </>
          )}
          {renderLeftContent()}
        </div>

        {/* DRAGGABLE RESIZER */}
        <div
          onMouseDown={handleMouseDown}
          className="w-1 bg-base-300 hover:bg-primary active:bg-primary cursor-col-resize flex-shrink-0 transition-colors duration-150"
        />

        {/* RIGHT PANEL */}
        <div
          style={{ width: `${100 - leftWidth}%` }}
          className="flex flex-col bg-base-200 flex-shrink-0 h-full overflow-hidden"
        >
          {/* LANGUAGE SELECTOR - sticky inside right panel */}
          <div className="flex justify-between items-center p-3 border-b bg-base-100 flex-shrink-0">
            <div className="flex gap-5">
              {[
                { label: "C++", value: "cpp" },
                { label: "Java", value: "java" },
                { label: "JavaScript", value: "javascript" },
              ].map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => changeLanguage(lang.value)}
                  className={`btn btn-sm ${
                    selectedLanguage === lang.value
                      ? "btn-accent"
                      : "btn-outline"
                  } font-bold`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleRunCode}
                disabled={running}
                className="btn btn-success btn-sm font-bold"
              >
                {running ? "Running..." : "Run"}
              </button>
              <button
                onClick={handleSubmitCode}
                disabled={submitting}
                className="btn btn-primary btn-sm"
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="flex-1 overflow-y-auto p-2">
            {!selectedSubmission && renderRightContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
