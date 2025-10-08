import axios from "axios";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:7998/api",
  headers: {
    "Content-Type": "application/json",
    "X-API-KEY": "REVIEW_KHOA_HOC"
  }
});

export default http;
