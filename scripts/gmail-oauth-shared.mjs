/** Desktop OAuth istemcisi — Google JSON'daki redirect_uris ile aynı olmalı. */
export const GMAIL_OAUTH_REDIRECT_URI = "http://localhost";

export const GMAIL_OAUTH_SCOPE = "https://www.googleapis.com/auth/gmail.send";

export function buildGmailAuthUrl(clientId) {
  return (
    "https://accounts.google.com/o/oauth2/v2/auth?" +
    new URLSearchParams({
      client_id: clientId,
      redirect_uri: GMAIL_OAUTH_REDIRECT_URI,
      response_type: "code",
      scope: GMAIL_OAUTH_SCOPE,
      access_type: "offline",
      prompt: "consent",
    })
  );
}

export function extractOAuthCode(raw) {
  const s = raw.trim();
  const fromUrl = s.match(/[?&]code=([^&]+)/);
  if (fromUrl) return decodeURIComponent(fromUrl[1]);
  return s;
}
