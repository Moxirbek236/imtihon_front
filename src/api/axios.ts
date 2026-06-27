import axios from 'axios';
import { clearAuthSession } from '@/lib/routes';

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

function shouldForceLogin(error: { response?: { status?: number; data?: { message?: string } }; config?: { headers?: { Authorization?: string } } }) {
  if (error.response?.status !== 401) return false;

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (!token) return true;

  const message = String(error.response?.data?.message || "").toLowerCase();
  const tokenWasSent = !!error.config?.headers?.Authorization;

  if (!tokenWasSent) return false;

  return (
    message.includes("expired") ||
    message.includes("invalid token") ||
    message.includes("jwt")
  );
}

import { toast } from 'sonner';

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = String(error.config?.url || "");
    if (requestUrl.includes("/auth/login")) {
      return Promise.reject(error);
    }

    if (error.response?.status === 403) {
      toast.error("Sizda ruxsat yo'q", { id: '403-error' });
    }

    if (shouldForceLogin(error)) {
      clearAuthSession();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.replace("/login");
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
