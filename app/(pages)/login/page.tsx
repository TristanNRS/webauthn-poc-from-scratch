"use client";

import { FormEvent, useEffect, useState } from "react";
import { supported, get } from "@github/webauthn-json";
import { generateChallenge, isLoggedIn } from "@/lib/auth";
import { useRouter } from "next/navigation";
import useSession from "@/lib/useSession";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const { session, isLoading } = useSession();

  useEffect(() => {
    if (!isLoading && isLoggedIn(session)) {
      router.replace("/admin");
    }
  }, [isLoading, session?.userId]);

  useEffect(() => {
    const checkAvailability = async () => {
      const available =
        await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      setIsAvailable(available && supported());
    };

    checkAvailability();
  }, []);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const challenge = generateChallenge();
    // Retrieve a registered passkey from the browser
    const credential = await get({
      publicKey: {
        challenge,
        timeout: 60000,
        userVerification: "required",
        rpId: "localhost",
      },
    });

    const result = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, credential, challenge }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (result.ok) {
      router.push("/admin");
    } else {
      const { message } = await result.json();
      setError(message);
    }
  };

  return (
    <>
      <h1>Login</h1>
      {isAvailable ? (
        <form method="POST" onSubmit={onSubmit}>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <input
            type="submit"
            value="Login"
            className="ml-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          />
          {error != null ? <pre>{error}</pre> : null}
        </form>
      ) : (
        <p>Sorry, webauthn is not available.</p>
      )}
    </>
  );
}
