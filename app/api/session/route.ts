import { NextResponse } from "next/server";
import getServerSession from "@/lib/useServerSession";

export async function GET() {
  try {
    const session = await getServerSession();
    const userId = session?.userId;
    return NextResponse.json({ userId });
  } catch (error: unknown) {
    console.error((error as Error).message);
    return new Response(JSON.stringify({ message: (error as Error).message }), {
      status: 500,
    });
  }
}
