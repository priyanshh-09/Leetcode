import {useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../authSlice";
import { useNavigate } from "react-router";
import { Link } from "react-router";
import axiosClient from "../utils/axiosClient";

export default function Home() {
  const { user } = useSelector((state) => state.auth);
  // console.log("USER:", user);

  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState({
    difficulty:'all',
    tag:"all",
    status:'all'
  });
  const [problems,setProblems] = useState([]);
  const [solvedproblems,setSolvedProblems] = useState([]);
  const navigate = useNavigate();

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

  const handleLogout = () => {
    dispatch(logoutUser());
    setOpen(false);
  };
  

  useEffect(() => {
    setPage(1);
  }, [filters]);
  
  useEffect(()=>{
    const fetchProblems = async()=>{
      try{
        const { data } = await axiosClient.get(
          `/problem/getall?page=${page}&limit=10`,

        );
        // console.log(data);
        setProblems(data.problems); 
        setTotalPages(data.totalPages);
      }catch(err){
        console.error("Error Fetching Problems", err)
      }
    }

    const fetchSolvedProblems = async () => {
      try {
        const { data } = await axiosClient.get("/problem/allproblems");
        setSolvedProblems(data);
      } catch (err) {
        console.error("Error Fetching Problems", err);
      }
    };

    fetchProblems();
    if(user) fetchSolvedProblems();
  },[user, page])

  const filteredProblem = problems.filter(problem =>{
    const difficultyMatch = filters.difficulty === 'all' || problem.difficulty === filters.difficulty;
    const tagMatch = filters.tag === 'all' || problem.tags === filters.tag;
    const statusMatch = filters.status === 'all' || 
       solvedproblems.some(sp=>sp._id === problem._id);
       return difficultyMatch && tagMatch && statusMatch;
  })

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <header className="navbar bg-base-100 shadow-md px-4 md:px-6 sticky top-0 z-50">
        {/* Left Logo */}
        <div className="flex-1">
          <Link to="/" className="text-3xl font-bold text-primary">
            DEV Arena
          </Link>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4 md:gap-8">
          {/* Create Problem (Only Admin) */}
          {user?.role === "admin" && (
            <Link to="/admin" className="btn btn-primary btn-sm md:btn-md ">
              Admin's Home
            </Link>
          )}

          {/* Profile Section */}
          {user && (
            <div className="relative">
              <div
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 cursor-pointer select-none"
              >
                <div className="avatar placeholder">
                  <div className="bg-primary text-primary-content rounded-full w-9 md:w-10 flex items-center justify-center">
                    <span className="uppercase font-semibold text-sm md:text-base">
                      {user.firstName.charAt(0)}
                    </span>
                  </div>
                </div>
                <span className="hidden md:block font-medium">
                  {user.firstName}
                </span>
              </div>

              {/* Dropdown */}
              {open && (
                <ul className="absolute right-0 mt-2 w-32 bg-base-100 shadow-lg rounded-box border z-50">
                  <li
                    onClick={handleLogout}
                    className="px-4 py-2 cursor-pointer text-error"
                  >
                    Logout
                  </li>
                </ul>
              )}
            </div>
          )}
        </div>
      </header>
      {/* Main */}
      <main className="p-6">
        <div className="sticky top-16 z-40 bg-base-200 pb-4">
          <h2 className="text-4xl mt-2 font-bold">Welcome to DEV Arena 🚀</h2>
          <div className="flex flex-wrap mt-6 gap-4 p-3 w-[80%] rounded-xl shadow justify-between">
            <select
              className="select select-bordered"
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
            >
              <option value="all">All Problems</option>
              <option value="solved">Solved Problems</option>
            </select>

            <select
              className="select select-bordered"
              value={filters.difficulty}
              onChange={(e) =>
                setFilters({ ...filters, difficulty: e.target.value })
              }
            >
              <option value="all">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <select
              className="select select-bordered"
              value={filters.tag}
              onChange={(e) => setFilters({ ...filters, tag: e.target.value })}
            >
              <option value="all">All Tags</option>
              <option value="array">Array</option>
              <option value="linkedlist">LinkedList</option>
              <option value="graph">Graph</option>
              <option value="Dp">Dp</option>
            </select>
          </div>
        </div>

        <div className="grid gap-3 mt-2 w-[90%]">
          {filteredProblem.map((problem) => {
            return (
              <div
                key={problem._id}
                onClick={() => navigate(`/problem/${problem._id}`)}
                className="
                    card bg-base-100 shadow-sm
                    hover:bg-base-200
                    hover:shadow-md
                    transition-all duration-200
                    cursor-pointer
                    border-l-4 border-transparent
                    hover:border-primary
                  "
              >
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <h2 className="card-title text-base-content transition-colors duration-200 hover:text-primary">
                      {problem.title}
                    </h2>
                    {solvedproblems.some((sp) => sp._id === problem._id) && (
                      <div className="badge badge-success gap-2 font-bold">
                        Solved
                      </div>
                    )}
                  </div>

                  {/* Difficulty + Tag */}
                  <div className="flex gap-2 mt-2">
                    {/* Difficulty */}
                    <div
                      className={`badge ${
                        problem.difficulty === "Easy"
                          ? "badge-success"
                          : problem.difficulty === "Medium"
                            ? "badge-warning"
                            : "badge-error"
                      } font-bold`}
                    >
                      {problem.difficulty}
                    </div>

                    {/* Tag */}
                    <div className="badge badge-outline badge-warning">
                      {problem.tags}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* PAGINATION */}
        <div className="flex justify-center items-center gap-4 mt-8">
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
      </main>
    </div>
  );
}
