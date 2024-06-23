import {
  IronSessionData,
  getIronSession,
  type IronSessionOptions,
} from "iron-session";

export const sessionOptions: IronSessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD!,
  cookieName: "next-webauthn",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

// Define the cookie structure globally for TypeScript
declare module "iron-session" {
  interface IronSessionData {
    userId?: number;
    challenge?: string;
  }
}

// Used by API handlers
export const getSession = async (req: Request, res: Response) => {
  const session = getIronSession<IronSessionData>(req, res, sessionOptions);
  return session;
};
