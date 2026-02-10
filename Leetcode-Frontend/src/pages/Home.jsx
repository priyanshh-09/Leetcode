import {useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../authSlice";
import { useNavigate } from "react-router";
import axiosClient from "../utils/axiosClient";

export default function Home() {
  const { user } = useSelector((state) => state.auth);
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

  const handleLogout = () => {
    dispatch(logoutUser());
    setOpen(false);
  };

  useEffect(()=>{
    const fetchProblems = async()=>{
      try{
         const { data } = await axiosClient.get("/problem/getall");
         setProblems(data);
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
  },[user])

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
      <header className="navbar bg-base-100 shadow-md px-6">
        {/* Left */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-primary cursor-pointer">
            LeetCode
          </h1>
        </div>

        {/* Right */}
        {user && (
          <div className="relative">
            {/* Profile Button */}
            <div
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              <div className="avatar placeholder">
                <div className="bg-primary text-primary-content rounded-full w-10 flex items-center justify-center">
                  <span className="uppercase font-semibold">
                    {user.firstName.charAt(0)}
                  </span>
                </div>
              </div>
              <span className="font-medium">{user.firstName}</span>
            </div>

            {/* Dropdown */}
            {open && (
              <ul className="absolute right-0 mt-1 w-30 bg-base-100 shadow-lg rounded-box border z-50">
                <li
                  onClick={handleLogout}
                  className="px-3 py-1 cursor-pointer text-error"
                >
                  Logout
                </li>
              </ul>
            )}
          </div>
        )}
      </header>

      {/* Main */}
      <main className="p-6">
        <h2 className="text-3xl font-bold">Welcome to LeetCode 🚀</h2>
        <div className="flex flex-wrap mt-6 gap-2 p-3 w-[80%] bg-base-100 rounded-xl shadow justify-between">
          <select
            className="select select-bordered"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
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

        <div className="grid gap-2 mt-10 w-[90%]">
          {filteredProblem.map((problem) => {
            return (
              <div
                key={problem._id}
                onClick={() => navigate(`/problem/${problem._id}`)}
                className="
                    card bg-base-100 shadow-sm mt-2
                    hover:bg-base-200
                    hover:shadow-md
                    transition-all duration-200
                    cursor-pointer
                    border-l-4 border-transparent
                    hover:border-primary
                  "
              >
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <h2
                      className="card-title text-base-content transition-colors duration-200 hover:text-primary "
                    >
                      {problem.title}
                    </h2>
                    {solvedproblems.some((sp) => sp._id === problem._id) && (
                      <div className="badge badge-success gap-2">Solved</div>
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
                      }`}
                    >
                      {problem.difficulty}
                    </div>

                    {/* Tag */}
                    <div className="badge badge-outline text-primary">
                      {problem.tags}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
