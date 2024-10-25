import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    console.log("Middleware running:", req.nextUrl.pathname)
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = { matcher: ["/", "/api/tasks/:path*"] }