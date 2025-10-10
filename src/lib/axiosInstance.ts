import axios, {
  // AxiosError,
  type AxiosInstance,
  // type AxiosRequestConfig,
  // type AxiosResponse,
} from "axios";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// interface FailedRequest {
//   resolve: (value?: unknown) => void;
//   reject: (error: unknown) => void;
// }

// let isRefreshing = false;
// let requestQueue: FailedRequest[] = [];

// const processQueue = (error: unknown, response?: AxiosResponse | null) => {
//   requestQueue.forEach((prom) => {
//     if (error) {
//       prom.reject(error);
//     } else {
//       prom.resolve(response);
//     }
//   });
//   requestQueue = [];
// };

// axiosInstance.interceptors.response.use(
//   (response: AxiosResponse) => response,
//   async (error: AxiosError) => {
//     const originalRequest = error.config as AxiosRequestConfig & {
//       _retry?: boolean;
//     };

//     if (
//       error.response?.status === 401 &&
//       !originalRequest._retry &&
//       !originalRequest.url?.includes("/api/v1/auth/refresh-token")
//     ) {
//       originalRequest._retry = true;

//       if (!isRefreshing) {
//         isRefreshing = true;

//         try {
//           const res = await axios.post(
//             "/api/v1/auth/refresh-token",
//             {},
//             {
//               withCredentials: true,
//             }
//           );

//           isRefreshing = false;
//           processQueue(null, res);

//           return axiosInstance(originalRequest);
//         } catch (refreshError) {
//           isRefreshing = false;
//           processQueue(refreshError);
//           window.location.href = "/login";
//           return Promise.reject(refreshError);
//         }
//       }

//       return new Promise((resolve, reject) => {
//         requestQueue.push({
//           resolve: () => resolve(axiosInstance(originalRequest)),
//           reject: (err: unknown) => reject(err),
//         });
//       });
//     }

//     return Promise.reject(error);
//   }
// );

export default axiosInstance;
