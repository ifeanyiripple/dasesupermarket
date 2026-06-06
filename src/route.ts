/** 
 * An array of routes that are accessible to the public.
 * These routes do not require authentication
 * @type {string[]}
  */
export const publicRoutes = [
    "/",
    "/auth/email-verification",
     "/gallery",
    "/terms",
    "/cart",
    "/checkout",
    "/blog",
    "/nysc-camp",
    "product/[id]",
    "/food/[id]",
    "/hotel/[id]",
    "/privacy-policy",
    "/api/paystack/webhook",
      "/api/verify-payment",
    "/blog/[id]",
    "/shop",
    //"/category/[id]",
    //"/search",
    "/sitemap",
    "/sitemap.xml",
   "/robots",
];
/** 
 * An array of routes that are used for authentification.
 * These routes will redirect logged in users to /settings
 * @type {string[]}
  */
export const authRoutes = [
    "/auth/login",
    "/auth/register",
    "/auth/error",
    "/auth/reset",
    "/auth/new-password"
]
/** 
 * The prefix for API authentification routes.
 * Routes that start with this prefix are used for API authentication purposes
 * @type {string}
  */
export const apiAuthPrefix = "/api/auth";
/** 
 * The default redirect path after logging in
 * @type {string}
  */
export const    DEFAULT_LOGIN_REDIRECT = "/"
