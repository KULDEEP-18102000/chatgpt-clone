import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define protected routes that require authentication
// const isProtectedRoute = createRouteMatcher([
//   '/chat(.*)',
//   '/api/chat(.*)',
//   '/api/conversations(.*)',
//   '/api/upload(.*)',
//   '/api/memory(.*)'
// ]);

export default clerkMiddleware(() => {
  // If it's a protected route and user is not authenticated, redirect to sign-in
  // if (isProtectedRoute(req) && !auth().userId) {
  //   return auth().redirectToSignIn();
  // }
  
  // // If user is authenticated and trying to access auth pages, redirect to chat
  // if (auth().userId && (req.nextUrl.pathname === '/' || req.nextUrl.pathname === '/sign-in' || req.nextUrl.pathname === '/sign-up')) {
  //   return NextResponse.redirect(new URL('/chat', req.url));
  // }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};