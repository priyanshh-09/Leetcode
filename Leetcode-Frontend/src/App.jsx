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
import DeleteProblem from "./Components/DeleteProblem"
import ProblemPage from "./pages/ProblemPage";
import UploadandDeleteProblem from "./Components/UploadandDeleteProblem";
import UploadProblem from "./Components/UploadProblem"; 
import UpdateProblems from "./Components/UpdateProblems"; 
import UpdateProblem from "./Components/UpdateProblem";
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
         <Route
           path="/admin/delete"
           element={
             isAuthenticated && user?.role === "admin" ? (
               <DeleteProblem />
             ) : (
               <Navigate to="/" />
             )
           }
         ></Route>
         <Route
           path="/admin/uploadanddelete"
           element={
             isAuthenticated && user?.role === "admin" ? (
               <UploadandDeleteProblem />
             ) : (
               <Navigate to="/" />
             )
           }
         ></Route>
         <Route
           path="/admin/upload/:problemId"
           element={
             isAuthenticated && user?.role === "admin" ? (
               <UploadProblem />
             ) : (
               <Navigate to="/" />
             )
           }
         ></Route>
         <Route
           path="/admin/updateproblems"
           element={
             isAuthenticated && user?.role === "admin" ? (
               <UpdateProblems />
             ) : (
               <Navigate to="/" />
             )
           }
         ></Route>
         <Route
           path="/admin/updateproblem/:problemId"
           element={
             isAuthenticated && user?.role === "admin" ? (
               <UpdateProblem />
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
