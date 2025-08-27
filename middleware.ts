import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/auth/sign-in',
  },
});

export const config = {
  matcher: ['/studio/:path*', '/projects/:path*', '/billing/:path*', '/settings/:path*'],
};
