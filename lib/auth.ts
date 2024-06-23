import {
  verifyRegistrationResponse,
  type VerifyRegistrationResponseOpts,
  type VerifiedRegistrationResponse,
  VerifiedAuthenticationResponse,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import crypto from "crypto";
import { prisma } from "@/prisma/db";
import { PublicKeyCredentialWithAttestationJSON } from "@github/webauthn-json";
import { IronSession, IronSessionData } from "iron-session";

export type RegisterAuthnUserPayload = {
  email: string;
  username: string;
  credential: PublicKeyCredentialWithAttestationJSON;
  challenge: string;
};

export type LoginAuthnUserPayload = {
  email: string;
  credential: PublicKeyCredentialWithAttestationJSON;
  challenge: string;
};

function clean(str: string) {
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export function generateChallenge() {
  return clean(crypto.randomBytes(32).toString("base64"));
}

const HOST_SETTINGS = {
  expectedOrigin: process.env.VERCEL_URL ?? "http://localhost:3000",
  expectedRPID: process.env.RPID ?? "localhost",
};

export function isLoggedIn(
  session: IronSession<IronSessionData> | undefined | null
) {
  return session && session?.userId != null;
}

export async function register(
  email: string,
  username: string,
  credential: PublicKeyCredentialWithAttestationJSON,
  challenge = ""
) {
  if (credential == null) {
    throw new Error("Invalid Credentials");
  }

  let verification: VerifiedRegistrationResponse;
  try {
    verification = await verifyRegistrationResponse({
      response: credential as VerifyRegistrationResponseOpts["response"],
      expectedChallenge: challenge,
      requireUserVerification: true,
      ...HOST_SETTINGS,
    });
  } catch (error) {
    console.error(error);
    throw error;
  }

  if (!verification.verified) {
    throw new Error("Registration verification failed");
  }

  const { credentialID, credentialPublicKey } =
    verification.registrationInfo ?? {};

  if (credentialID == null || credentialPublicKey == null) {
    throw new Error("Registration failed");
  }

  const user = await prisma.user.create({
    data: {
      email,
      username,
      credentials: {
        create: {
          externalId: credentialID,
          publicKey: Buffer.from(credentialPublicKey),
        },
      },
    },
  });

  console.log(`Registered new user ${user.id}`);
  return user;
}

export async function login(
  email: string,
  credential: PublicKeyCredentialWithAttestationJSON,
  challenge = ""
) {
  if (credential?.id == null) {
    throw new Error("Invalid Credentials");
  }

  // Find our credential record
  const userCredential = await prisma.credential.findUnique({
    select: {
      id: true,
      userId: true,
      externalId: true,
      publicKey: true,
      signCount: true,
      user: {
        select: {
          email: true,
        },
      },
    },
    where: {
      externalId: credential.id,
    },
  });

  if (userCredential == null) {
    throw new Error("Unknown User");
  }

  let verification: VerifiedAuthenticationResponse;
  try {
    // Verify browser credential with our record
    verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge: challenge,
      authenticator: {
        credentialID: userCredential.externalId,
        credentialPublicKey: userCredential.publicKey,
        counter: userCredential.signCount,
      },
      ...HOST_SETTINGS,
    });

    // Update our record's sign in count
    await prisma.credential.update({
      data: {
        signCount: verification.authenticationInfo.newCounter,
      },
      where: {
        id: userCredential.id,
      },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }

  if (!verification.verified || email !== userCredential.user.email) {
    throw new Error("Login verification failed");
  }

  console.log(`Logged in as user ${userCredential.userId}`);
  return userCredential.userId;
}
