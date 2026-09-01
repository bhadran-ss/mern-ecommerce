import { getFrontendConfig } from "../config/env.js";
import { createApiClient } from "./api-client.js";

const { apiUrl } = getFrontendConfig();
const axiosInstance = createApiClient({ baseURL: apiUrl });

export const clearClientSecurityState = () =>
  axiosInstance.clearSecurityState();
export const configureAuthenticationFailure = (handler) =>
  axiosInstance.setAuthenticationFailureHandler(handler);

export default axiosInstance;
