import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Egyéni útvonalak létrehozása, amelyeket védeni szeretnél
const isPublicRoute = createRouteMatcher([
  '/',
  '/events/:id',
  '/api/webhook/clerk',
  '/api/webhook/stripe',
  '/api/uploadthing'
]);

// clerkMiddleware beállítása az authentikáció kezelésére
export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
