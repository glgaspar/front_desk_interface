import Api from "./Components/Api";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('front_desk_awesome_cookie')?.value; 
    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }
    Api().get("/validate")
        .then(response => {
            console.log("user is valid:", response.data);
        }).catch(error => {
            if (error.status === 401 || error.status === 403) {
                NextResponse.redirect(new URL('/login', request.url));
                return;
            }
            if (error.status === 404) {
                NextResponse.redirect(new URL('/register', request.url));
                return;
            }
            console.error("API Error:", error);
            alert("An error occurred while validating the user.");
            NextResponse.redirect(new URL('/login', request.url));
        });
	


    // Optionally, validate the token (e.g., against a database or using a JWT library)
    // For demonstration, assume any token is valid here.
    // In a real application, you'd perform actual token validation.

    // Continue to the requested page if authenticated
    return NextResponse.next();
}

// Define paths where the middleware should run
export const config = {
    matcher: [
        /*
        * Match all paths except:
        * 1. /login
        * 2. /register
        * 3. Static files (/_next, /favicon, etc.)
        */
        '/((?!login|register|_next|favicon.ico).*)',
    ],
};
