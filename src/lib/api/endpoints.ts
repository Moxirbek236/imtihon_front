// Placeholder API endpoints
import client from "./client";
import { User, Role } from "./types";

export const authApi = {
  login: async (phone: string, password: string): Promise<{ accessToken: string; token: string; role: Role; user: User }> => {
    console.log("authApi.login called with", phone, password);
    // This is a placeholder. It will not actually log anyone in.
    // It returns a dummy response to make the application compile.
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // You need to replace this with a real API call.
    // Example: const response = await client.post("/auth/login", { phone, password });

    // Dummy data
    const dummyUser: User = {
      id: "1",
      name: "Dummy User",
      phone: phone,
      role: "student"
    };

    return {
      accessToken: "dummy-access-token",
      token: "dummy-token",
      role: "student",
      user: dummyUser
    };
  }
};
