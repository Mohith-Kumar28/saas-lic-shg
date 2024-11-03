import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { AppConfig } from './utils/AppConfig';

const intlMiddleware = createMiddleware({
  locales: AppConfig.locales,
  localePrefix: AppConfig.localePrefix,
  defaultLocale: AppConfig.defaultLocale,
});

// const isProtectedRoute = createRouteMatcher([
//   '/dashboard(.*)',
//   '/:locale/dashboard(.*)',
// ]);

const ispublicRoute = createRouteMatcher([
  '/',
  '/:locale',
  '/site',
  '/:locale/site',
  '/about',
  '/:locale/about',
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

// export default function middleware(
//   request: NextRequest,
//   event: NextFetchEvent,
// ) {
// Run Clerk middleware only when it's necessary
// if (
//   request.nextUrl.pathname.includes('/sign-in')
//   || request.nextUrl.pathname.includes('/sign-up')
//   || isProtectedRoute(request)
// ) {
export default clerkMiddleware(async (auth, req) => {
  if (!ispublicRoute(req)) {
    const locale
          = req.nextUrl.pathname.match(/(\/.*)\/agency/)?.at(1) ?? '';

    const signInUrl = new URL(`${locale}/sign-in`, req.url);

    await auth.protect({
      // `unauthenticatedUrl` is needed to avoid error: "Unable to find `next-intl` locale because the middleware didn't run on this request"
      unauthenticatedUrl: signInUrl.toString(),
    });
  }
  return afterAuth(req);
});
// }

//   return intlMiddleware(request);
// }

async function afterAuth(req: any) {
  // rewrite for domains
  const url = req.nextUrl;
  const searchParams = url.searchParams.toString();
  const hostname = req.headers;

  const pathWithSearchParams = `${url.pathname}${
    searchParams.length > 0 ? `?${searchParams}` : ''
  }`;

  // if subdomain exists
  const customSubDomain = hostname
    .get('host')
    ?.split(`${process.env.NEXT_PUBLIC_DOMAIN}`)
    .filter(Boolean)[0];

  if (customSubDomain) {
    return NextResponse.rewrite(
      new URL(`/${customSubDomain}${pathWithSearchParams}`, req.url),
    );
  }

  // if (url.pathname === '/sign-in' || url.pathname === '/sign-up') {
  //   return NextResponse.redirect(new URL(`/agency/sign-in`, req.url));
  // }
  // if (
  //   url.pathname === '/'
  //   || (url.pathname === '/site' && url.host === process.env.NEXT_PUBLIC_DOMAIN)
  // ) {
  //   return NextResponse.rewrite(new URL('/site', req.url));
  // }

  if (
    url.pathname.startsWith('/agency')
    || url.pathname.startsWith('/subaccount')
  ) {
    return NextResponse.rewrite(new URL(`${pathWithSearchParams}`, req.url));
  }
  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next|monitoring).*)', '/', '/(api|trpc)(.*)'], // Also exclude tunnelRoute used in Sentry from the matcher
};
