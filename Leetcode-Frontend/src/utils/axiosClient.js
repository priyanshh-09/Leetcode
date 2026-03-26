import axios from "axios";

const axiosClient = axios.create({
  baseURL: "https://leetcode-1e9h.onrender.com",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosClient;
