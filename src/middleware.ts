import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    if (process.env.NEXT_PUBLIC_ENV === "DEV") {
        return NextResponse.next();
    }
    const { pathname } = request.nextUrl;
    
    // Get the session token
    const token = request.cookies.get('front_desk_awesome_cookie')?.value;
    
    // We want to determine if the user is authenticated.
    let isLoggedIn = false;
    let redirectTarget: string | null = null;
    const responseHeaders = new Headers();

    if (token) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (apiUrl) {
            try {
                // Fetch validation status from backend
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000);

                const response = await fetch(`${apiUrl}/validate`, {
                    method: 'GET',
                    headers: {
                        'Cookie': `front_desk_awesome_cookie=${token}`,
                        'Content-Type': 'application/json',
                    },
                    signal: controller.signal,
                });
                clearTimeout(timeoutId);

                // Forward Set-Cookie header if the backend sent one
                const setCookieHeader = response.headers.get('set-cookie');
                if (setCookieHeader) {
                    responseHeaders.set('set-cookie', setCookieHeader);
                }

                if (response.status === 200) {
                    isLoggedIn = true;
                } else if (response.status === 401 || response.status === 403) {
                    isLoggedIn = false;
                    redirectTarget = '/login';
                } else if (response.status === 404) {
                    isLoggedIn = false;
                    redirectTarget = '/register';
                } else {
                    isLoggedIn = false;
                    redirectTarget = '/login';
                }
            } catch (error) {
                console.error("API Error during validation:", error);
                // Fallback: in DEV, we can be lenient if the backend is down or unreachable
                if (process.env.NEXT_PUBLIC_ENV === "DEV") {
                    isLoggedIn = true;
                } else {
                    isLoggedIn = false;
                    redirectTarget = '/login';
                }
            }
        } else {
            // No API URL defined; fall back to checking if token exists
            isLoggedIn = true;
        }
    }

    const isAuthPage = pathname === '/login' || pathname === '/register';

    if (!isLoggedIn) {
        // User is not logged in (either no token or validation failed)
        if (!isAuthPage) {
            const target = redirectTarget || '/login';
            const redirectResponse = NextResponse.redirect(new URL(target, request.url));
            // Copy forwarded headers if any
            responseHeaders.forEach((value, key) => {
                redirectResponse.headers.set(key, value);
            });
            return redirectResponse;
        }
    } else {
        // User is logged in
        if (isAuthPage) {
            const redirectResponse = NextResponse.redirect(new URL('/home', request.url));
            // Copy forwarded headers if any
            responseHeaders.forEach((value, key) => {
                redirectResponse.headers.set(key, value);
            });
            return redirectResponse;
        }
    }

    // Let the request proceed, propagating any set-cookie headers
    const nextResponse = NextResponse.next();
    responseHeaders.forEach((value, key) => {
        nextResponse.headers.set(key, value);
    });
    return nextResponse;
}

// Define paths where the middleware should run
export const config = {
    matcher: [
        /*
         * Match all paths except:
         * 1. /api (API routes)
         * 2. /_next (Next.js internals)
         * 3. Static files (/favicon.ico, etc.)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};