import axios from "axios";
import { appConfig } from "../config/env.js";

const axiosInstance = axios.create({
  baseURL: appConfig.apiUrl,
  withCredentials: true,
});



export default axiosInstance;
