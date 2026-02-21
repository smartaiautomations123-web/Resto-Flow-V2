export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL || "";
  const appId = import.meta.env.VITE_APP_ID || "";

  // Safe check for window being defined (SSR safe)
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const redirectUri = origin ? `${origin}/api/oauth/callback` : '';
  const state = redirectUri ? btoa(redirectUri) : '';

  if (!oauthPortalUrl) {
    return "/"; // Safe fallback
  }

  try {
    const url = new URL(`${oauthPortalUrl}/app-auth`);
    url.searchParams.set("appId", appId);
    if (redirectUri) url.searchParams.set("redirectUri", redirectUri);
    if (state) url.searchParams.set("state", state);
    url.searchParams.set("type", "signIn");

    return url.toString();
  } catch (error) {
    // If URL parsing fails, return a safe fallback
    return "/";
  }
};
