"use client";
import { FormEvent, useEffect, useState } from "react";
import { create, supported } from "@github/webauthn-json";
import { generateChallenge, isLoggedIn } from "@/lib/auth";
import { useRouter } from "next/navigation";
import useSession from "@/lib/useSession";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();
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

    // Create the credential
    const credential = await create({
      publicKey: {
        challenge: challenge,
        rp: {
          // Change these later
          name: "next-webauthn",
          id: "localhost",
        },
        user: {
          // Maybe change these later
          id: window.crypto.randomUUID(),
          name: email,
          displayName: username,
        },
        // Don't change these later
        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
        timeout: 60000,
        attestation: "direct",
        authenticatorSelection: {
          residentKey: "required",
          userVerification: "required",
        },
      },
    });

    const result = await fetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, username, credential, challenge }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Redirect to the admin page or render errors
    if (result.ok) {
      router.push("/admin");
    } else {
      const { message } = await result.json();
      setError(message);
    }
  };

  return (
    <>
      {!isLoading && !isLoggedIn(session) ? (
        <>
          <h1>Register Account</h1>
          {isAvailable ? (
            <form method="POST" onSubmit={onSubmit}>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
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
                value="Register"
                className="ml-5 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              />
              {error != null ? <pre>{error}</pre> : null}
            </form>
          ) : (
            <p>Sorry, WebAuthn is not available.</p>
          )}
        </>
      ) : null}
    </>
  );
}
