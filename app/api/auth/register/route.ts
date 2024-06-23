import { RegisterAuthnUserPayload, register } from "@/lib/auth";
import { getSession } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RegisterAuthnUserPayload;
    const { email, username, credential, challenge = "" } = body;

    const user = await register(email, username, credential, challenge);

    const res = new Response(JSON.stringify({ userId: user.id }));
    const session = await getSession(req, res);
    session.userId = user.id;
    await session.save();

    return res;
  } catch (error: unknown) {
    console.error((error as Error).message);
    return new Response(JSON.stringify({ message: (error as Error).message }), {
      status: 500,
    });
  }
}
