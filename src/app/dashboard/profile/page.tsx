import { serverFetch } from "../../../api/server";
import ProfileClient from "../../../components/ProfileClient";

export const dynamic = "force-dynamic";

export default async function Page() {
  let initialProfile = null;

  try {
    const data = await serverFetch(`/auth/profile`, {
      cache: "no-store"
    });
    initialProfile = data?.data || data || null;
  } catch (err) {
    console.error("Error fetching profile on server", err);
  }

  return (
    <ProfileClient initialProfile={initialProfile} />
  );
}
