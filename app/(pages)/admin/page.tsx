import { logout } from "@/app/actions";
import { isLoggedIn } from "@/lib/auth";
import useServerSession from "@/lib/useServerSession";
import { redirect } from "next/navigation";

export default async function Admin() {
  const session = await useServerSession();

  if (!isLoggedIn(session)) {
    redirect("/");
  }

  return (
    <>
      <h1>Admin</h1>
      <span>User ID: {session?.userId ?? ""}</span>
      <form action={logout}>
        <input
          type="submit"
          value="Logout"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        />
      </form>
    </>
  );
}
