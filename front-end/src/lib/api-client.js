import axios from "axios";

const unsafeMethods = new Set(["post", "put", "patch", "delete"]);
const refreshExcludedPaths = [
  "/auth/login",
  "/auth/signup",
  "/auth/refresh-token",
];

const isRefreshEligible = (config = {}) => {
  const path = String(config.url ?? "").split("?")[0];
  return !refreshExcludedPaths.some((excluded) => path.endsWith(excluded));
};

export const createApiClient = ({ baseURL, adapter } = {}) => {
  const clientOptions = { baseURL, withCredentials: true };
  if (adapter) {
    clientOptions.adapter = adapter;
  }

  const client = axios.create(clientOptions);
  const sessionClient = axios.create(clientOptions);
  let csrfToken;
  let csrfRequest;
  let refreshRequest;
  let authenticationFailureHandler = () => {};

  const clearSecurityState = () => {
    csrfToken = undefined;
  };

  const obtainCsrfToken = async () => {
    if (csrfToken) {
      return csrfToken;
    }

    csrfRequest ??= sessionClient
      .get("/auth/csrf-token")
      .then(({ data }) => {
        if (typeof data?.csrfToken !== "string" || !data.csrfToken) {
          throw new Error("The server did not provide a CSRF token");
        }
        csrfToken = data.csrfToken;
        return csrfToken;
      })
      .finally(() => {
        csrfRequest = undefined;
      });

    return csrfRequest;
  };

  const refreshSession = async () => {
    const token = await obtainCsrfToken();
    return sessionClient.post(
      "/auth/refresh-token",
      {},
      { headers: { "X-CSRF-Token": token } },
    );
  };

  client.interceptors.request.use(async (request) => {
    if (unsafeMethods.has(String(request.method).toLowerCase())) {
      request.headers.set("X-CSRF-Token", await obtainCsrfToken());
    }
    return request;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const request = error.config;
      if (
        error.response?.status !== 401 ||
        !request ||
        request.__authRetry ||
        !isRefreshEligible(request)
      ) {
        return Promise.reject(error);
      }

      request.__authRetry = true;
      if (!refreshRequest) {
        refreshRequest = refreshSession()
          .catch((refreshError) => {
            clearSecurityState();
            authenticationFailureHandler();
            throw refreshError;
          })
          .finally(() => {
            refreshRequest = undefined;
          });
      }

      await refreshRequest;
      return client(request);
    },
  );

  return Object.assign(client, {
    clearSecurityState,
    setAuthenticationFailureHandler: (handler) => {
      authenticationFailureHandler =
        typeof handler === "function" ? handler : () => {};
    },
  });
};
