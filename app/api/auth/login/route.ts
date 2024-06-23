import { LoginAuthnUserPayload, login } from "@/lib/auth";
import { getSession } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as LoginAuthnUserPayload;
    const { email, credential, challenge = "" } = body;
    const userId = await login(email, credential, challenge);

    const res = new Response(JSON.stringify({ userId }));
    const session = await getSession(req, res);
    session.userId = userId;
    await session.save();

    return res;
  } catch (error) {
    console.error((error as Error).message);
    return new Response(JSON.stringify({ message: (error as Error).message }), {
      status: 500,
    });
  }
}
