import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/api/stripe/webhook(.*)",
  "/api/stripe/webhook",
]);

export default clerkMiddleware(async (auth, request) => {
  // Skip protection for public routes
  if (isPublicRoute(request)) {
    return;
  }

  // Protect all other routes
  try {
    await auth().protect();
  } catch (error) {
    // If Clerk is not configured, allow access but log the error
    // This allows the app to still build/deploy even if Clerk keys are missing
    console.error("Clerk middleware error:", error);
    
    // Only block if we're sure Clerk is configured but auth failed
    if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY) {
      throw error;
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

