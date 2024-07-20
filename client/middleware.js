// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/forum(.*)"]);

// export default clerkMiddleware((auth, req) => {
//   if (isProtectedRoute(req)) auth().protect();
// });

// export const config = {
//   matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
// };
// middleware.js
// import { clerkMiddleware } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";

// export default clerkMiddleware((auth, req) => {
//   // Your middleware logic here
//   return NextResponse.next();
// });

// export const config = {
//   matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
// };

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);

export default clerkMiddleware((auth, req) => {
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }
  // Your other middleware logic here
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};