import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {z} from "zod";
import axiosClient from "../utils/axiosClient";
import { useNavigate } from "react-router";


const problemSchema = z.object({
  title: z.string().min(1, "Title is Required"),
  description: z.string().min(1, "Description is Required"),
  difficulty: z.enum(["Easy", "Hard", "Medium"]),
  tags: z.enum(["array", "linkedlist", "graph", "Dp"]),
  visibleTestCases: z.array(
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
  startcode: z.array(
    z.object({
        language: z.enum(["C++", "Java", "Javascript"]),
        initialcode: z.string().min(1, "Complete Code is Required"),
      })
    ).length(3, "All three Language required"),
  referenceSolution: z.array(
    z.object({
        language: z.enum(["C++", "Java", "Javascript"]),
        completeCode: z.string().min(1, "Complete Code is Required"),
      })
    ).length(3, "All three Language required"),
}); 


export default function CreateProblem() {
  const navigate = useNavigate();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
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
        { language: "C++", completecode: "" },
        { language: "Java", completecode: "" },
        { language: "Javascript", completecode: "" },
      ],
    },
  });

  const { fields: visibleFields, append: addVisible } = useFieldArray({
    control,
    name: "visibleTestCases",
  });

  const { fields: invisibleFields, append: addInvisible } = useFieldArray({
    control,
    name: "invisibleTestCases",
  });

  const onSubmit = async (data) => {
    try {
        // console.log("FORM SUBMITTED", data);
        // console.log(JSON.stringify(data.referenceSolution, null, 2));
      await axiosClient.post("/problem/create", data);
      navigate("/");
    } catch (err) {
      console.error("Error: "+err);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-4xl mx-auto bg-base-100 p-6 rounded-xl shadow space-y-6"
      >
        <h1 className="text-2xl font-bold">Create Problem</h1>

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
            <textarea
              key={lang}
              {...register(`startcode.${i}.initialcode`)}
              placeholder={`${lang} Starter Code`}
              className="textarea textarea-bordered w-full mb-2"
            />
          ))}
        </div>

        {/* Reference Solution */}
        <div>
          <h2 className="font-semibold mb-2">Reference Solution</h2>
          {["C++", "Java", "Javascript"].map((lang, i) => (
            <textarea
              key={lang}
              {...register(`referenceSolution.${i}.completeCode`)}
              placeholder={`${lang} Complete Solution`}
              className="textarea textarea-bordered w-full mb-2"
            />
          ))}
        </div>

        {/* Submit */}
        <button type="submit" className="btn btn-primary w-full">
          Create Problem
        </button>
      </form>
    </div>
  );
}





