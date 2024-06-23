"use server";
import {
  IronSession,
  IronSessionData,
  getServerActionIronSession,
} from "iron-session";
import { sessionOptions } from "@/lib/session";
import { cookies } from "next/headers";

export default async function useServerSession(): Promise<
  IronSession<IronSessionData>
> {
  const session = await getServerActionIronSession<IronSessionData>(
    sessionOptions,
    cookies()
  );

  return session;
}
