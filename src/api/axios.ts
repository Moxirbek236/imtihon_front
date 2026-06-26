import axios from 'axios';

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// Token har bir requestda localStorage dan o'qiladi (race condition muammosini hal qiladi)
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
<<<<<<< HEAD

=======
>>>>>>> cce73d74249cdab1cf4e57beb72abbc4162c6622
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

<<<<<<< HEAD
export default axiosClient;
=======
export default axiosClient;
>>>>>>> cce73d74249cdab1cf4e57beb72abbc4162c6622
