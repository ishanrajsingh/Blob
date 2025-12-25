import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";

// generic client factory - pass AppRouter type when using
export function createClient(url: string) {
  return createTRPCClient<any>({
    links: [
      httpBatchLink({
        url,
        transformer: superjson,
      }),
    ],
  });
}
