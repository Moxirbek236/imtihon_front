import { cookies } from "next/headers";

export async function serverFetch(endpoint: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const res = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "Cookie": `token=${token}` } : {}),
      ...options.headers,
    },
  });

  const json = await res.json();
  if (!res.ok) {
    return { success: false, data: [], error: json };
  }
  return json;
}
