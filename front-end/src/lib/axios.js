import axios from "axios";
import { getFrontendConfig } from "../config/env.js";

const { apiUrl } = getFrontendConfig();

const axiosInstance = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
});



export default axiosInstance;
