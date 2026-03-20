export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL - redirects to the server-side Google OAuth flow
export const getLoginUrl = () => {
  return `${window.location.origin}/api/auth/google`;
};
