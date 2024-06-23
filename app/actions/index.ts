"use server";
import getServerSession from "@/lib/useServerSession";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function logout() {
  const session = await getServerSession();
  session.destroy();
  revalidatePath("/admin");
  redirect("/");
}
