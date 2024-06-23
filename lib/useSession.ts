import useSWR from "swr";
import { IronSession, IronSessionData } from "iron-session";

const sessionApiRoute = "/api/session";

async function fetchJson<JSON = unknown>(
  input: RequestInfo,
  init?: RequestInit
): Promise<JSON> {
  return fetch(input, {
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    ...init,
  }).then((res) => res.json());
}

// Used by client components
export default function useSession(): {
  session: IronSession<IronSessionData>;
  isLoading: boolean;
} {
  const { data: session, isLoading } = useSWR(
    sessionApiRoute,
    fetchJson<IronSession<IronSessionData>>,
    {
      fallbackData: {} as IronSession<IronSessionData>,
    }
  );

  return { session, isLoading };
}
