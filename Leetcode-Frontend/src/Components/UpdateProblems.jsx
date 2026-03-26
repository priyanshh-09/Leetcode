import { useEffect, useState } from "react";
import axiosClient from "../utils/axiosClient";
import { NavLink } from "react-router";


export default function UpdateProblems() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);       
  const [totalPages, setTotalPages] = useState(1);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchProblems();
  }, [page]); // 

  const fetchProblems = async () => {
    try {
      setLoading(true);

        const { data } = await axiosClient.get(
            `/problem/getall?page=${page}&limit=10`
        );

      setProblems(data.problems);     
      setTotalPages(data.totalPages); 

    } catch (err) {
      setError("Failed to fetch problems");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500">{error.response.data.error}</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold mb-10">Update Problems</h2>

      {success && (
        <div className="alert alert-success mb-4 font-bold">
        <span>{success}</span>
       </div>
        )}

      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Difficulty</th>
              <th>Tags</th>
              <th>Action 1</th> 
            </tr>
          </thead>

          <tbody>
            {problems.map((p, i) => (
              <tr key={p._id}>
                <th>{(page - 1) * 10 + i + 1}</th>

                <td>{p.title}</td>

                <td>
                  <span
                    className={`badge ${
                      p.difficulty === "Easy"
                        ? "badge-success"
                        : p.difficulty === "Medium"
                        ? "badge-warning"
                        : "badge-error"
                    }`}
                  >
                    {p.difficulty}
                  </span>
                </td>

                <td>
                  <span className="badge badge-outline">{p.tags}</span>
                </td>

                <td>
                   <NavLink 
                      to={`/admin/updateproblem/${p._id}`}
                      className={`btn border-red-400`}>
                       Update
                   </NavLink>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

     
      <div className="flex justify-center gap-4 mt-6">
        <button
          className="btn"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </button>

        <span className="font-semibold">
          Page {page} of {totalPages}
        </span>

        <button
          className="btn"
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}