import { createAuthMiddleware, APIError } from "better-auth/api";

// Better Auth "before" hook middleware.
// - Runs before Better Auth endpoints execute.
// - Attaches the current user (if any) to the hook context.
// - Can block access to certain endpoints when not authenticated.
export const beforeAuthHook = createAuthMiddleware(async (ctx) => {
    // Allow core public auth endpoints to proceed without checks
    const publicPaths = [
        "/ok",
        "/sign-in",
        "/sign-up",
        "/github",
        "/github/callback",
        "/link",
    ];
    if (publicPaths.some((p) => ctx.path.startsWith(p))) {
        return; // no-op, continue
    }

        // Determine if this path requires authentication
    const requiresAuth = ctx.path.startsWith("/session") || ctx.path.startsWith("/me");
  
        // Read session cookie (don’t parse user here; rely on Better Auth later)
        const sessionCookieName = ctx.context.authCookies.sessionToken.name;
            const sessionToken = ctx.getCookie(sessionCookieName);

        if (requiresAuth && !sessionToken) {
        throw new APIError("UNAUTHORIZED", { message: "Authentication required" });
    }

        // Expose token to subsequent hooks/endpoints via context if needed
    return {
        context: {
            ...ctx.context,
                sessionToken: sessionToken ?? null,
        },
    };
});

// Note: wire this into betterAuth in auth.controller.ts like:
// betterAuth({ hooks: { before: beforeAuthHook }, ... })
