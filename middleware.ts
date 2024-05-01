// Importáljuk a clerkMiddleware-t a '@clerk/nextjs/server' csomagból
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Opcionálisan létrehozhatunk útvonalakat kijelölő segédfüggvényt
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/forum(.*)',
]);

// Konfiguráljuk és exportáljuk a clerkMiddleware-t
export default clerkMiddleware((auth, req) => {
  // Védjük a meghatározott útvonalakat
  if (isProtectedRoute(req)) {
    auth().protect();
  }
});

// Konfiguráljuk a middleware matchereit
export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
