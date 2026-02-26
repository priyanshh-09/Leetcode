import {Routes, Route, Navigate} from "react-router";
import './App.css'
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { checkAuth } from "./authSlice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
// import Problem from "./pages/Problem";
import AdminHome from "./pages/AdminHome";
import CreateProblem from "./Components/CreateProblem";
import ProblemPage from "./pages/ProblemPage";
// const User = require("../../src/models/user");

function App() {
  const dispatch = useDispatch();
  const {isAuthenticated,loading,user}= useSelector((state)=>state.auth)

  useEffect(()=>{
    dispatch(checkAuth());
  },[dispatch])
  


  if(loading){
    return <div className="min-h-screen flex items-center justify-center">
      <span className="loading loading-spinner loading-xl"></span>
    </div>
  }
   return (
     <>
       <Routes>
         <Route
           path="/"
           element={isAuthenticated ? <Home /> : <Navigate to="/signup" />}
         ></Route>
         <Route
           path="/login"
           element={isAuthenticated ? <Navigate to="/" /> : <Login />}
         ></Route>
         <Route
           path="/signup"
           element={isAuthenticated ? <Navigate to="/" /> : <Signup />}
         ></Route>
         <Route path="/problem/:id" element={<ProblemPage />} />
         <Route
           path="/admin"
           element={
             isAuthenticated && user?.role === "admin" ? (
               <AdminHome />
             ) : (
               <Navigate to="/" />
             )
           }
         ></Route>
         <Route
           path="/admin/create"
           element={
             isAuthenticated && user?.role === "admin" ? (
               <CreateProblem />
             ) : (
               <Navigate to="/" />
             )
           }
         ></Route>
       </Routes>
     </>
   );
}

export default App
