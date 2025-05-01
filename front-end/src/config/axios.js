import Axios from "axios";

const BASE_API = process.env.NEXT_PUBLIC_BACKEND_URL;

const createAxiosInstance = (baseURL = BASE_API) => {
  const instance = Axios.create({
    baseURL,
    // withCredentials: true,
  });

  // set default headers with token from local storage
  instance.interceptors.request.use(
    (config) => {
      // config.headers['platform'] = 'pms';
      // config.headers["credentials"] = "include";
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.data?.err_type === "UNAUTHORIZED") {
        // Phát sự kiện logout hoặc sự kiện thông báo lỗi
        document.dispatchEvent(
          new CustomEvent("serverResponse", {
            detail: { status: 401, message: "Unauthorized" },
          })
        );
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

// Xuất mặc định instance với BASE_API
const axiosInstance = createAxiosInstance();

export { createAxiosInstance };
export default axiosInstance;
