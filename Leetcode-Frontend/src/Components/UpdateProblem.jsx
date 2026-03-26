import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axiosClient from "../utils/axiosClient";
import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";

const problemSchema = z.object({
  title: z.string().min(1, "Title is Required"),
  description: z.string().min(1, "Description is Required"),
  difficulty: z.enum(["Easy", "Hard", "Medium"]),
  tags: z.enum(["array", "linkedlist", "graph", "Dp"]),
  visibleTestCases: z
    .array(
      z.object({
        input: z.string().min(1, "Input is required"),
        output: z.string().min(1, "Output is required"),
        explanation: z.string().min(1, "Explanation is Required"),
      }),
    )
    .min(1, "At least one visible test case is Required"),
  invisibleTestCases: z.array(
    z.object({
      input: z.string().min(1, "Input is required"),
      output: z.string().min(1, "Output is required"),
    }),
  ),
  startcode: z
    .array(
      z.object({
        language: z.enum(["C++", "Java", "Javascript"]),
        initialcode: z.string().min(1, "Complete Code is Required"),
      }),
    )
    .length(3, "All three Language required"),
  referenceSolution: z
    .array(
      z.object({
        language: z.enum(["C++", "Java", "Javascript"]),
        completeCode: z.string().min(1, "Complete Code is Required"),
      }),
    )
    .length(3, "All three Language required"),
});

const UpdateProblem = () => {
  const navigate = useNavigate();
  const { problemId } = useParams();

  // ✅ Track loading and toast state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null); // { type: "success"|"error", message: string }

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000); // auto-hide after 3s
  };

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      visibleTestCases: [{ input: "", output: "", explanation: "" }],
      invisibleTestCases: [{ input: "", output: "" }],
      startcode: [
        { language: "C++", initialcode: "" },
        { language: "Java", initialcode: "" },
        { language: "Javascript", initialcode: "" },
      ],
      referenceSolution: [
        { language: "C++", completeCode: "" },
        { language: "Java", completeCode: "" },
        { language: "Javascript", completeCode: "" },
      ],
    },
  });

  const {
    fields: visibleFields,
    append: addVisible,
    replace: replaceVisible,
  } = useFieldArray({ control, name: "visibleTestCases" });

  const {
    fields: invisibleFields,
    append: addInvisible,
    replace: replaceInvisible,
  } = useFieldArray({ control, name: "invisibleTestCases" });

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await axiosClient.get(`/problem/get/${problemId}`);
        const problem = res.data;

        reset({
          title: problem.title,
          description: problem.description,
          difficulty: problem.difficulty,
          tags: problem.tags,
          visibleTestCases: problem.visibleTestCases.map((tc) => ({
            input: tc.input,
            output: tc.output,
            explanation: tc.explanation,
          })),
          invisibleTestCases: problem.invisibleTestCases.map((tc) => ({
            input: tc.input,
            output: tc.output,
          })),
          startcode: problem.startcode.map((s) => ({
            language: s.language,
            initialcode: s.initialcode,
          })),
          referenceSolution: problem.referenceSolution.map((s) => ({
            language: s.language,
            completeCode: s.completeCode,
          })),
        });

        // ✅ Explicitly set language fields AFTER reset
        ["C++", "Java", "Javascript"].forEach((lang, i) => {
          setValue(`startcode.${i}.language`, lang);
          setValue(`referenceSolution.${i}.language`, lang);
        });
      } catch (err) {
        console.error("Failed to fetch problem:", err);
      }
    };

    fetchProblem();
  }, [problemId]);
 
useEffect(() => {
  ["C++", "Java", "Javascript"].forEach((lang, i) => {
    setValue(`startcode.${i}.language`, lang);
    setValue(`referenceSolution.${i}.language`, lang);
  });
}, []); // runs once on mount



  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try { 
      await axiosClient.put(`/problem/update/${problemId}`, data);
      showToast("success", "Problem updated successfully!");
      setTimeout(() => navigate("/"), 1500); // small delay so user sees toast
    } catch (err) {
      console.error("Update failed:", err);
      showToast("error", "Failed to update problem. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 p-6">
      {/* ✅ Toast Notification */}
      {toast && (
        <div className="toast toast-top toast-center z-50">
          <div
            className={`alert ${
              toast.type === "success" ? "alert-success" : "alert-error"
            }`}
          >
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-4xl mx-auto bg-base-100 p-6 rounded-xl shadow space-y-6"
      >
        <h1 className="text-2xl font-bold">Update Problem Here</h1>

        {/* Title */}
        <input
          {...register("title")}
          placeholder="Problem Title"
          className="input input-bordered w-full"
        />
        <p className="text-error">{errors.title?.message}</p>

        {/* Description */}
        <textarea
          {...register("description")}
          placeholder="Problem Description"
          className="textarea textarea-bordered w-full"
        />
        <p className="text-error">{errors.description?.message}</p>

        {/* Difficulty */}
        <select
          {...register("difficulty")}
          className="select select-bordered w-full"
        >
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        {/* Tags */}
        <select {...register("tags")} className="select select-bordered w-full">
          <option value="array">Array</option>
          <option value="linkedlist">LinkedList</option>
          <option value="graph">Graph</option>
          <option value="Dp">DP</option>
        </select>

        {/* Visible Test Cases */}
        <div>
          <h2 className="font-semibold mb-2">Visible Test Cases</h2>
          {visibleFields.map((_, index) => (
            <div key={index} className="grid grid-cols-3 gap-2 mb-2">
              <input
                {...register(`visibleTestCases.${index}.input`)}
                placeholder="Input"
                className="input input-bordered"
              />
              <input
                {...register(`visibleTestCases.${index}.output`)}
                placeholder="Output"
                className="input input-bordered"
              />
              <input
                {...register(`visibleTestCases.${index}.explanation`)}
                placeholder="Explanation"
                className="input input-bordered"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              addVisible({ input: "", output: "", explanation: "" })
            }
            className="btn btn-sm btn-outline"
          >
            + Add Visible Case
          </button>
        </div>

        {/* Invisible Test Cases */}
        <div>
          <h2 className="font-semibold mb-2">Invisible Test Cases</h2>
          {invisibleFields.map((_, index) => (
            <div key={index} className="grid grid-cols-2 gap-2 mb-2">
              <input
                {...register(`invisibleTestCases.${index}.input`)}
                placeholder="Input"
                className="input input-bordered"
              />
              <input
                {...register(`invisibleTestCases.${index}.output`)}
                placeholder="Output"
                className="input input-bordered"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => addInvisible({ input: "", output: "" })}
            className="btn btn-sm btn-outline"
          >
            + Add Invisible Case
          </button>
        </div>

        {/* Start Code */}
        <div>
          <h2 className="font-semibold mb-2">Start Code</h2>
          {["C++", "Java", "Javascript"].map((lang, i) => (
            <div key={lang}>
              <label className="label-text font-medium block mb-1">
                {lang}
              </label>
              <textarea
                {...register(`startcode.${i}.initialcode`)}
                placeholder={`${lang} Starter Code`}
                className="textarea textarea-bordered w-full mb-2"
              />
              <p className="text-error text-sm">
                {errors.startcode?.[i]?.initialcode?.message}
              </p>
            </div>
          ))}
        </div>

        {/* Reference Solution */}
        <div>
          <h2 className="font-semibold mb-2">Reference Solution</h2>
          {["C++", "Java", "Javascript"].map((lang, i) => (
            <div key={lang}>
              <label className="label-text font-medium block mb-1">
                {lang}
              </label>
              <textarea
                {...register(`referenceSolution.${i}.completeCode`)}
                placeholder={`${lang} Complete Solution`}
                className="textarea textarea-bordered w-full mb-2"
              />
              <p className="text-error text-sm">
                {errors.referenceSolution?.[i]?.completeCode?.message}
              </p>
            </div>
          ))}
        </div>

        {/* ✅ Submit button with loading spinner */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-100 p-4 rounded text-sm">
            <pre>{JSON.stringify(errors, null, 2)}</pre>
          </div>
        )}
        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Updating...
            </>
          ) : (
            "Update Problem"
          )}
        </button>
      </form>
    </div>
  );
};

export default UpdateProblem;
