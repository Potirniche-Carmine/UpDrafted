import { auth as betterAuth } from "@/lib/auth";
import { headers } from "next/headers";

async function fetchServerSession(requestHeaders?: Headers) {
    return betterAuth.api.getSession({
        headers: requestHeaders ?? await headers(),
        query: {
            disableCookieCache: true,
        },
    });
}

export async function getServerSession(requestHeaders?: Headers) {
    return fetchServerSession(requestHeaders);
}

export async function auth() {
    const session = await fetchServerSession();

    return {
        userId: session?.user?.id ?? null,
        user: session?.user ?? null,
        sessionId: session?.session?.id ?? null,
        session: session?.session ?? null,
    };
}

export const auth_server = auth;
